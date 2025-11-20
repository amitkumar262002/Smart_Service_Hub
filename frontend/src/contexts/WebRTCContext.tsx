import React, { createContext, useContext, useState, useCallback } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';

interface WebRTCContextType {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isCalling: boolean;
  isInCall: boolean;
  callType: 'audio' | 'video' | null;
  peerConnection: RTCPeerConnection | null;
  error: string | null;
  isMuted: boolean;
  isVideoOff: boolean;
  startCall: (type: 'audio' | 'video') => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  setBookingId: (id: string) => void;
}

const WebRTCContext = createContext<WebRTCContextType | undefined>(undefined);

interface WebRTCProviderProps {
  children: React.ReactNode;
  initialBookingId?: string;
}

export const WebRTCProvider: React.FC<WebRTCProviderProps> = ({ 
  children,
  initialBookingId = ''
}) => {
  const [bookingId, setBookingId] = useState(initialBookingId);
  
  const {
    localStream,
    remoteStream,
    isCalling,
    isInCall,
    callType,
    error,
    isMuted,
    isVideoOff,
    peerConnection,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteVideoRef
  } = useWebRTC(bookingId);

  const value: WebRTCContextType = {
    localStream,
    remoteStream,
    isCalling,
    isInCall,
    callType,
    error,
    isMuted,
    isVideoOff,
    peerConnection,
    startCall,
    endCall,
    toggleMute,
    toggleVideo,
    localVideoRef,
    remoteVideoRef,
    setBookingId
  };

  return (
    <WebRTCContext.Provider value={value}>
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTCContext = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error('useWebRTCContext must be used within a WebRTCProvider');
  }
  return context;
};
