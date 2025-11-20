import { useState, useRef, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getSessionUser } from '../auth';

interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCalling: boolean;
  isInCall: boolean;
  callType: 'audio' | 'video' | null;
  peerConnection: RTCPeerConnection | null;
  error: string | null;
  isMuted: boolean;
  isVideoOff: boolean;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
  ]
};

export function useWebRTC(bookingId: string) {
  const [state, setState] = useState<WebRTCState>({
    localStream: null,
    remoteStream: null,
    isCalling: false,
    isInCall: false,
    callType: null,
    peerConnection: null,
    error: null,
    isMuted: false,
    isVideoOff: false,
  });

  const socketRef = useRef<Socket | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!bookingId) return;

    const socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;
    const currentUser = getSessionUser();

    if (!currentUser) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return;
    }

    socket.on('connect', () => {
      console.log('WebSocket connected');
      socket.emit('join', { user_id: currentUser.id, booking_id: bookingId });
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setState(prev => ({ ...prev, error: 'Connection error. Please check your internet.' }));
    });

    // Handle incoming signals
    socket.on('signal', async (data: any) => {
      if (!peerConnectionRef.current) return;

      try {
        if (data.type === 'offer') {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.data)
          );
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          
          const user = getSessionUser();
          socket.emit('signal', {
            to: data.from,
            from: user?.id,
            type: 'answer',
            data: answer
          });
          
          setState(prev => ({ ...prev, isInCall: true }));
          
          // Clear call timeout when call is established
          if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
          }
        } 
        else if (data.type === 'answer') {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.data)
          );
          setState(prev => ({ ...prev, isInCall: true }));
          
          // Clear call timeout when call is established
          if (callTimeoutRef.current) {
            clearTimeout(callTimeoutRef.current);
          }
        } 
        else if (data.type === 'ice-candidate' && data.data) {
          try {
            await peerConnectionRef.current.addIceCandidate(
              new RTCIceCandidate(data.data)
            );
          } catch (e) {
            console.error('Error adding ICE candidate:', e);
          }
        }
      } catch (error) {
        console.error('Error handling signal:', error);
        setState(prev => ({ ...prev, error: 'Error handling call signal' }));
      }
    });

    socket.on('call-ended', () => {
      endCall();
    });

    socket.on('user-disconnected', () => {
      endCall();
    });

    return () => {
      socket.disconnect();
    };
  }, [bookingId]);

  const setupPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;
    
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        const user = getSessionUser();
        socketRef.current.emit('signal', {
          to: bookingId,
          from: user?.id,
          type: 'ice-candidate',
          data: event.candidate.toJSON()
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind);
      setState(prev => ({
        ...prev,
        remoteStream: event.streams[0],
        isInCall: true
      }));
    };

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);
      if (pc.connectionState === 'disconnected' || 
          pc.connectionState === 'failed' ||
          pc.connectionState === 'closed') {
        endCall();
      }
    };

    pc.onicegatheringstatechange = () => {
      console.log('ICE gathering state:', pc.iceGatheringState);
    };

    return pc;
  }, [bookingId]);

  const startCall = useCallback(async (type: 'audio' | 'video') => {
    try {
      setState(prev => ({ 
        ...prev, 
        isCalling: true,
        callType: type,
        error: null,
        isMuted: false,
        isVideoOff: false
      }));

      const constraints = {
        video: type === 'video' ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      const pc = setupPeerConnection();
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: type === 'video'
      });
      
      await pc.setLocalDescription(offer);

      if (socketRef.current) {
        const user = getSessionUser();
        socketRef.current.emit('signal', {
          to: bookingId,
          from: user?.id,
          type: 'offer',
          data: offer
        });
      }

      setState(prev => ({
        ...prev,
        localStream: stream,
        peerConnection: pc
      }));

      if (localVideoRef.current && type === 'video') {
        localVideoRef.current.srcObject = stream;
      }

      // Set call timeout - if no answer in 30 seconds, end call
      callTimeoutRef.current = setTimeout(() => {
        if (!state.isInCall) {
          setState(prev => ({ 
            ...prev, 
            error: 'Call timeout - no response from other user' 
          }));
          endCall();
        }
      }, 30000);

    } catch (err: any) {
      console.error('Error starting call:', err);
      let errorMsg = 'Failed to access camera/microphone. Please check permissions.';
      
      if (err.name === 'NotAllowedError') {
        errorMsg = 'Permission denied. Please allow access to camera/microphone.';
      } else if (err.name === 'NotFoundError') {
        errorMsg = 'No camera/microphone found on your device.';
      } else if (err.name === 'NotReadableError') {
        errorMsg = 'Camera/microphone is already in use by another application.';
      }

      setState(prev => ({ 
        ...prev, 
        isCalling: false,
        callType: null,
        error: errorMsg
      }));
    }
  }, [bookingId, setupPeerConnection, state.isInCall]);

  const endCall = useCallback(() => {
    if (callTimeoutRef.current) {
      clearTimeout(callTimeoutRef.current);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (socketRef.current) {
      const user = getSessionUser();
      socketRef.current.emit('end-call', { 
        to: bookingId,
        from: user?.id 
      });
    }

    setState({
      localStream: null,
      remoteStream: null,
      isCalling: false,
      isInCall: false,
      callType: null,
      peerConnection: null,
      error: null,
      isMuted: false,
      isVideoOff: false
    });
  }, [bookingId, state.localStream]);

  const toggleMute = useCallback(() => {
    if (state.localStream) {
      const audioTracks = state.localStream.getAudioTracks();
      const isMuted = !state.isMuted;
      audioTracks.forEach(track => {
        track.enabled = !isMuted;
      });
      setState(prev => ({ ...prev, isMuted: isMuted }));
    }
  }, [state.localStream, state.isMuted]);

  const toggleVideo = useCallback(() => {
    if (state.localStream) {
      const videoTracks = state.localStream.getVideoTracks();
      const isVideoOff = !state.isVideoOff;
      videoTracks.forEach(track => {
        track.enabled = !isVideoOff;
      });
      setState(prev => ({ ...prev, isVideoOff: isVideoOff }));
    }
  }, [state.localStream, state.isVideoOff]);

  return {
    ...state,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteVideoRef
  };
}
