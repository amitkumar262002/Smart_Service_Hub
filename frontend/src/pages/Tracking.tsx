import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { BookingsAPI, ChatsAPI, api } from '@/api/client'
import { useI18n } from '@/i18n'
import { useTheme } from '@/context/ThemeContext'
import { THEME, COLORS, SPACING, RADIUS, SHADOWS, TRANSITIONS } from '@/styles/theme'
import MapView from '@/components/MapView'

type LiveLoc = { lat:number; lng:number }
type AdvancedTrackData = {
  booking_id: string
  provider_location: LiveLoc
  customer_location: LiveLoc & { pincode?: string; address?: string }
  status: string
  eta_minutes: number
  distance_km: number
  progress: number
  provider_hub: LiveLoc
  route_info: { total_distance_km: number; elapsed_minutes: number; total_minutes: number }
}

export default function Tracking() {
  const { bookingId } = useParams()
  const { isDark } = useTheme()
  const theme = isDark ? THEME.dark : THEME.light
  
  const [loc, setLoc] = useState<LiveLoc|null>(null)
  const [userLoc, setUserLoc] = useState<LiveLoc|null>(null)
  const [userPincode, setUserPincode] = useState('')
  const [userAddress, setUserAddress] = useState('')
  const [status, setStatus] = useState<'accepted'|'on_the_way'|'nearby'|'completed'|string>('accepted')
  const [etaMin, setEtaMin] = useState<number|null>(null)
  const [distanceKm, setDistanceKm] = useState<number|null>(null)
  const [progress, setProgress] = useState(0)
  const [routeInfo, setRouteInfo] = useState<any>(null)
  const [msgs, setMsgs] = useState<Array<{id: string; sender: string; text: string; image_url?: string|null; createdAt?: string}>>([])
  const [isCalling, setIsCalling] = useState(false)
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null)
  const [input, setInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const { t } = useI18n()
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [useAdvancedTracking, setUseAdvancedTracking] = useState(true)
  const [isTyping, setIsTyping] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(8000)
  const [pincodeHistory, setPincodeHistory] = useState<Array<{pincode: string; timestamp: string; lat: number; lng: number}>>([])
  const [showPincodeHistory, setShowPincodeHistory] = useState(false)
  const [trackingMode, setTrackingMode] = useState<'live' | 'pincode'>('live')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  
  // Advanced Chat Features
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showCallUI, setShowCallUI] = useState(false)
  const [callStatus, setCallStatus] = useState<'connecting' | 'connected' | 'ended'>('connecting')
  const [callDuration, setCallDuration] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isSpeakerOn, setIsSpeakerOn] = useState(false)
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)

  async function refreshLocation() {
    if (!bookingId) return
    try {
      // Try advanced tracking first (with pincode, route info, etc)
      if (useAdvancedTracking) {
        try {
          const res = await api.get(`/api/bookings/${bookingId}/advanced-track`)
          const data = res.data as AdvancedTrackData
          setLoc(data.provider_location)
          setUserLoc(data.customer_location)
          setUserPincode(data.customer_location.pincode || '')
          setUserAddress(data.customer_location.address || '')
          setProgress(data.progress)
          setEtaMin(data.eta_minutes)
          setDistanceKm(data.distance_km)
          setStatus(data.status)
          setRouteInfo(data.route_info)
          setLastUpdated(new Date().toLocaleTimeString())
          return
        } catch (e) {
          console.warn('Advanced tracking failed, falling back to basic tracking')
          setUseAdvancedTracking(false)
        }
      }
      
      // Fallback to basic tracking
      const res = await BookingsAPI.track(bookingId)
      setLoc(res.provider_location)
      if (res.user_location) {
        setUserLoc({ lat: res.user_location.lat, lng: res.user_location.lng })
        setUserAddress(res.user_location.address || '')
      }
      if (typeof res.progress === 'number') setProgress(res.progress)
      if (typeof res.eta_minutes === 'number') setEtaMin(res.eta_minutes)
      if (typeof res.distance_km === 'number') setDistanceKm(res.distance_km)
      if (res.status) setStatus(res.status)
      setLastUpdated(new Date().toLocaleTimeString())
    } catch (e) {
      console.error('Location refresh failed:', e)
    }
  }

  useEffect(() => {
    if (!bookingId) return
    refreshLocation()
    
    // Only auto-refresh if enabled
    if (!autoRefresh) return
    
    const id = window.setInterval(refreshLocation, refreshInterval)
    return () => window.clearInterval(id)
  }, [bookingId, autoRefresh, refreshInterval])

  // Try to use customer browser geolocation for more accurate "you" marker
  useEffect(() => {
    if (!('geolocation' in navigator)) return
    
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        try {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setUserLoc(coords)
          
          if (bookingId) {
            // Get real pincode from booking data or use mock
            const mockPincode = Math.floor(100000 + Math.random() * 900000).toString()
            
            // Update customer location with pincode
            BookingsAPI.updateCustomerLocation(bookingId, coords, mockPincode).catch(err => {
              console.warn('Failed to update customer location:', err)
              // ignore network errors for background location update
            })
            
            // Add to pincode history
            setPincodeHistory(prev => [...prev.slice(-9), {
              pincode: mockPincode,
              timestamp: new Date().toLocaleTimeString(),
              lat: coords.lat,
              lng: coords.lng
            }])
          }
        } catch (err) {
          console.error('Error processing geolocation:', err)
        }
      },
      err => {
        console.warn('Geolocation error:', err)
        // ignore errors, fallback to backend-inferred user_location
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000
      }
    )
    
    return () => navigator.geolocation.clearWatch(watchId)
  }, [bookingId])

  useEffect(() => {
    if (!bookingId) return
    let mounted = true
    async function load() {
      try {
        const list = await ChatsAPI.list(bookingId!)
        if (!mounted) return
        setMsgs(list || [])
      } catch (err) {
        console.error('Failed to load messages:', err)
        if (!mounted) return
        // Don't show error to user, just keep existing messages
      }
    }
    load()
    const id = setInterval(load, 5000)
    return () => { mounted = false; clearInterval(id) }
  }, [bookingId])

  // Emoji functions
  const addEmoji = (emoji: string) => {
    setInput(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  // WebRTC calling functions
  const initializePeerConnection = async () => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      })
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // Send ICE candidate to peer via signaling server
          console.log('ICE candidate:', event.candidate)
        }
      }
      
      pc.ontrack = (event) => {
        setRemoteStream(event.streams[0])
      }
      
      setPeerConnection(pc)
      return pc
    } catch (err) {
      console.error('Failed to initialize peer connection:', err)
    }
  }

  const startCall = async (type: 'audio' | 'video') => {
    try {
      setCallType(type)
      setShowCallUI(true)
      setCallStatus('connecting')
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video'
      })
      
      setLocalStream(stream)
      
      const pc = await initializePeerConnection()
      if (pc) {
        stream.getTracks().forEach(track => pc.addTrack(track, stream))
        
        // Create and send offer
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        
        // Here you would send the offer to the peer via signaling
        console.log('Call offer created:', offer)
        
        // Simulate connection after 2 seconds
        setTimeout(() => {
          setCallStatus('connected')
          startCallTimer()
        }, 2000)
      }
    } catch (err) {
      console.error('Failed to start call:', err)
      endCall()
    }
  }

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop())
    }
    if (peerConnection) {
      peerConnection.close()
    }
    setLocalStream(null)
    setRemoteStream(null)
    setPeerConnection(null)
    setShowCallUI(false)
    setCallStatus('connecting')
    setCallDuration(0)
    setIsCalling(false)
    setCallType(null)
  }

  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !isMuted
        setIsMuted(!isMuted)
      }
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !isVideoOn
        setIsVideoOn(!isVideoOn)
      }
    }
  }

  const startCallTimer = () => {
    const interval = setInterval(() => {
      setCallDuration(prev => {
        if (prev >= 599) { // Max 10 minutes
          clearInterval(interval)
          endCall()
          return 0
        }
        return prev + 1
      })
    }, 1000)
  }

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  async function send() {
    if (!bookingId) return
    const text = input.trim()
    const img = imageUrl.trim()
    if (!text && !img) return
    try {
      const msg = await ChatsAPI.send(bookingId, text, 'customer', img || undefined)
      setMsgs(m => [...m, msg])
      setInput('')
      setImageUrl('')
    } catch (err) {
      console.error('Failed to send message:', err)
      // Show error but keep input
      alert('Failed to send message. Please try again.')
    }
  }

  async function onFileChange(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadedFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      if (url) setImageUrl(url)
    }
    reader.readAsDataURL(file)
  }

  function statusLabel() {
    switch (status) {
      case 'accepted': return 'Accepted'
      case 'on_the_way': return 'On the way'
      case 'nearby': return 'Nearby'
      case 'completed': return 'Completed'
      default: return status || 'Tracking'
    }
  }

  function statusTone() {
    if (status === 'completed') return { bg:'#022c22', border:'#22c55e' }
    if (status === 'nearby') return { bg:'#0f172a', border:'#fbbf24' }
    if (status === 'on_the_way') return { bg:'#0f172a', border:'#38bdf8' }
    return { bg:'#020617', border:'#4b5563' }
  }

  const tone = statusTone()
  const progressPct = Math.round(Math.min(1, Math.max(0, progress)) * 100)

  const directionsLink = loc && userLoc
    ? `https://www.google.com/maps/dir/?api=1&origin=${loc.lat},${loc.lng}&destination=${userLoc.lat},${userLoc.lng}`
    : (loc ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : '#')

  const handleStartCall = async (type: 'audio' | 'video') => {
    await startCall(type)
  }

  const handleEndCall = () => {
    setIsCalling(false)
    setCallType(null)
    // Cleanup WebRTC connections
  }

  return (
    <div>
      <h2>{t('track.title')}</h2>
      {loc ? (
        <div className="card">
          <div className="card-title">{t('track.providerLocation')}</div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8,gap:8}}>
            <span className="chip chip-sm" style={{background:tone.bg,borderColor:tone.border}}>{statusLabel()}</span>
            <div style={{fontSize:12,color:'#9ca3af',textAlign:'right'}}>
              {etaMin !== null && etaMin >= 0 && (
                <div>ETA: ~{etaMin} min</div>
              )}
              {distanceKm !== null && (
                <div>{distanceKm} km away</div>
              )}
            </div>
          </div>
          <div style={{fontSize:12, color:'#9ca3af'}}>Lat: {loc.lat.toFixed(4)} · Lng: {loc.lng.toFixed(4)}</div>
          {lastUpdated && (
            <div style={{fontSize:11,color:'#9ca3af',marginTop:4}}>Last updated: {lastUpdated}</div>
          )}
          <div style={{fontSize:11,color:'#9ca3af',marginTop:4}}>
            Orange dot = provider · Blue dot = you (customer)
          </div>
          <div style={{marginTop:8, marginBottom:8}}>
            <div style={{fontSize:11, color:'#9ca3af', marginBottom:4}}>Journey progress</div>
            <div style={{height:6,borderRadius:999,background:'#020617',overflow:'hidden',border:'1px solid #1f2937'}}>
              <div style={{width:`${progressPct}%`,height:'100%',background:'linear-gradient(90deg,#22c55e,#facc15)'}} />
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#9ca3af',marginBottom:8}}>
            <span>Accepted</span>
            <span>On the way</span>
            <span>Nearby</span>
            <span>Completed</span>
          </div>
          {/* Advanced Tracking Info */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', marginTop: '12px'}}>
            {/* Provider Card */}
            <div style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', padding: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'}}>
              <div style={{fontSize: '11px', opacity: 0.9, marginBottom: '4px'}}>🚗 Provider</div>
              <div style={{fontSize: '13px', fontWeight: '600', marginBottom: '4px'}}>On the Way</div>
              <div style={{fontSize: '10px', opacity: 0.8}}>
                {loc && `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`}
              </div>
            </div>

            {/* Customer Card */}
            <div style={{background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderRadius: '8px', padding: '12px', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'}}>
              <div style={{fontSize: '11px', opacity: 0.9, marginBottom: '4px'}}>📍 Your Location</div>
              <div style={{fontSize: '13px', fontWeight: '600', marginBottom: '4px'}}>Waiting</div>
              <div style={{fontSize: '10px', opacity: 0.8}}>
                {userLoc && `${userLoc.lat.toFixed(4)}, ${userLoc.lng.toFixed(4)}`}
              </div>
            </div>
          </div>

          {/* Distance & ETA Card */}
          <div style={{background: '#1f2937', borderRadius: '8px', padding: '12px', border: '1px solid #374151', marginBottom: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
            <div>
              <div style={{fontSize: '11px', color: '#9ca3af', marginBottom: '4px'}}>📏 Distance</div>
              <div style={{fontSize: '18px', fontWeight: '700', color: '#f3f4f6'}}>{distanceKm ? `${distanceKm.toFixed(1)} km` : '—'}</div>
            </div>
            <div>
              <div style={{fontSize: '11px', color: '#9ca3af', marginBottom: '4px'}}>⏱️ ETA</div>
              <div style={{fontSize: '18px', fontWeight: '700', color: '#f3f4f6'}}>{etaMin !== null && etaMin >= 0 ? `~${etaMin} min` : '—'}</div>
            </div>
          </div>

          <div className="track-map">
            <MapView provider={loc} user={userLoc} eta={etaMin} distance={distanceKm} status={status} />
          </div>
          {/* Tracking Controls */}
          <div style={{marginTop: '12px', padding: '12px', background: '#1f2937', borderRadius: '8px', border: '1px solid #374151', marginBottom: '12px'}}>
            <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap'}}>
              <button 
                onClick={() => setAutoRefresh(!autoRefresh)}
                style={{padding: '6px 12px', background: autoRefresh ? '#667eea' : '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'}}
              >
                {autoRefresh ? '⏸️ Stop Auto' : '▶️ Auto Refresh'}
              </button>
              <button 
                onClick={refreshLocation}
                style={{padding: '6px 12px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'}}
              >
                🔄 Refresh Now
              </button>
              <button 
                onClick={() => setTrackingMode(trackingMode === 'live' ? 'pincode' : 'live')}
                style={{padding: '6px 12px', background: trackingMode === 'pincode' ? '#8b5cf6' : '#374151', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'}}
              >
                {trackingMode === 'live' ? '📍 Pincode Mode' : '🗺️ Live Mode'}
              </button>
              <button 
                onClick={() => setShowPincodeHistory(!showPincodeHistory)}
                style={{padding: '6px 12px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'}}
              >
                📋 History ({pincodeHistory.length})
              </button>
              <select 
                value={refreshInterval}
                onChange={e => setRefreshInterval(Number(e.target.value))}
                disabled={!autoRefresh}
                style={{padding: '6px 8px', background: '#374151', color: '#f3f4f6', border: '1px solid #4b5563', borderRadius: '6px', cursor: autoRefresh ? 'pointer' : 'not-allowed', fontSize: '11px', opacity: autoRefresh ? 1 : 0.5}}
              >
                <option value={3000}>3s</option>
                <option value={5000}>5s</option>
                <option value={8000}>8s</option>
                <option value={10000}>10s</option>
              </select>
            </div>
            
            {/* Pincode History */}
            {showPincodeHistory && pincodeHistory.length > 0 && (
              <div style={{background: '#0f1419', borderRadius: '6px', padding: '10px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #374151', marginBottom: '10px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid #374151'}}>
                  <div style={{fontSize: '11px', color: '#9ca3af', fontWeight: '600'}}>📍 Pincode History (Last 10)</div>
                  <div style={{display: 'flex', gap: '6px'}}>
                    <button
                      onClick={() => {
                        const csv = pincodeHistory.map(h => `${h.pincode},${h.timestamp},${h.lat},${h.lng}`).join('\n')
                        const link = document.createElement('a')
                        link.href = `data:text/csv;charset=utf-8,${encodeURIComponent('Pincode,Timestamp,Latitude,Longitude\n' + csv)}`
                        link.download = `pincode-history-${Date.now()}.csv`
                        link.click()
                      }}
                      style={{padding: '3px 8px', background: '#374151', color: '#9ca3af', border: '1px solid #4b5563', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', fontWeight: '600'}}
                    >
                      📥 Export
                    </button>
                    <button
                      onClick={() => setPincodeHistory([])}
                      style={{padding: '3px 8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '10px', fontWeight: '600'}}
                    >
                      🗑️ Clear
                    </button>
                  </div>
                </div>
                {pincodeHistory.map((item, idx) => (
                  <div key={idx} style={{fontSize: '10px', color: '#d1d5db', padding: '6px', background: '#1f2937', borderRadius: '4px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <span>🔹 {item.pincode}</span>
                    <span style={{color: '#9ca3af'}}>{item.timestamp}</span>
                    <span style={{color: '#667eea', fontSize: '9px'}}>{item.lat.toFixed(3)}, {item.lng.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{marginTop:8, display:'flex', gap:8, flexWrap:'wrap'}}>
            <button className="btn" type="button" onClick={refreshLocation} style={{background: '#667eea', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'}}>🔄 Refresh location</button>
          <a
            href={directionsLink}
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{marginTop:0, background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px'}}
          >
            🗺️ {t('track.openMaps')}
          </a>
          </div>
        </div>
      ) : (
        <div>{t('track.loading')}</div>
      )}
      {bookingId && (
        <div style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)', border: '1px solid #374151', borderRadius: '12px', padding: '20px', marginTop: '20px' }}>
          {/* Chat Header */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #4b5563'}}>
            <div>
              <h3 style={{margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700', color: '#f3f4f6'}}>💬 Chat with Provider</h3>
              <p style={{margin: '0', fontSize: '12px', color: '#9ca3af'}}>Ask questions or share details about the service</p>
            </div>
            {!isCalling && (
              <div style={{display: 'flex', gap: '8px'}}>
                <button 
                  onClick={() => handleStartCall('audio')}
                  title="Start audio call"
                  style={{padding: '8px 12px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'}}
                >
                  📞 Call
                </button>
                <button 
                  onClick={() => handleStartCall('video')}
                  title="Start video call"
                  style={{padding: '8px 12px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px'}}
                >
                  📹 Video
                </button>
              </div>
            )}
          </div>
          {/* Chat Messages */}
          <div style={{background: '#0f1419', borderRadius: '8px', padding: '12px', minHeight: '180px', maxHeight: '350px', overflowY: 'auto', marginBottom: '12px', border: '1px solid #1f2937'}}>
            {msgs.length === 0 && (
              <div style={{textAlign: 'center', color: '#6b7280', fontSize: '12px', padding: '30px 15px'}}>
                📝 No messages yet
              </div>
            )}
            {msgs.map(m => {
              const isCustomer = m.sender === 'customer'
              const ts = m.createdAt ? new Date(m.createdAt) : null
              const time = ts ? ts.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : ''
              const label = isCustomer ? 'You' : 'Provider'
              const url = (m.image_url || '').trim()
              const isHttp = /^https?:\/\//i.test(url)
              const isData = /^data:image\//i.test(url)
              const isPdf = isHttp && /\.pdf(\?|$)/i.test(url)
              const isVideo = isHttp && /\.(mp4|webm|ogg)(\?|$)/i.test(url)
              const isImage = isHttp && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(url) || isData
              return (
                <div
                  key={m.id}
                  style={{marginBottom: '8px', display: 'flex', justifyContent: isCustomer ? 'flex-end' : 'flex-start', gap: '6px'}}
                >
                  <div style={{maxWidth: '65%', background: isCustomer ? '#667eea' : '#1f2937', color: isCustomer ? '#fff' : '#d1d5db', padding: '8px 12px', borderRadius: '6px', borderBottomLeftRadius: isCustomer ? '6px' : '1px', borderBottomRightRadius: isCustomer ? '1px' : '6px'}}>
                    {m.text && <div style={{fontSize: '12px', lineHeight: '1.3', wordBreak: 'break-word'}}>{m.text}</div>}
                    {url && (
                      <div style={{marginTop: isImage ? '6px' : '4px'}}>
                        {isPdf ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            style={{padding:'3px 6px', fontSize:'10px', background: isCustomer ? 'rgba(255,255,255,0.2)' : '#374151', color: '#fff', borderRadius: '3px', display: 'inline-block', textDecoration: 'none'}}
                          >
                            📄 PDF
                          </a>
                        ) : isData ? (
                          <img
                            src={url}
                            alt="shared"
                            style={{maxWidth:'120px', maxHeight:'100px', borderRadius:'4px', border:'1px solid #1f2937', cursor: 'pointer'}}
                            onClick={() => { setSelectedImage(url); setShowImageModal(true) }}
                            title="Click to expand"
                          />
                        ) : isImage ? (
                          <img
                            src={url}
                            alt="shared"
                            style={{maxWidth:'120px', maxHeight:'100px', borderRadius:'4px', border:'1px solid #1f2937', cursor: 'pointer'}}
                            onClick={() => { setSelectedImage(url); setShowImageModal(true) }}
                            title="Click to expand"
                          />
                        ) : (
                          <span style={{fontSize: '10px', color: isCustomer ? 'rgba(255,255,255,0.7)' : '#9ca3af'}}>
                            📎 Link
                          </span>
                        )}
                      </div>
                    )}
                    <div style={{fontSize: '10px', marginTop: '4px', color: isCustomer ? 'rgba(255,255,255,0.5)' : '#6b7280'}}>{time}</div>
                  </div>
                </div>
              )
            })}
            {isTyping && (
              <div style={{display: 'flex', gap: '4px', alignItems: 'center', padding: '8px 12px', background: '#1f2937', borderRadius: '6px', width: 'fit-content'}}>
                <span style={{fontSize: '10px', color: '#9ca3af'}}>Provider is typing</span>
                <span style={{display: 'flex', gap: '2px'}}>
                  <span style={{width: '4px', height: '4px', background: '#667eea', borderRadius: '50%', animation: 'pulse 1.4s infinite'}} />
                  <span style={{width: '4px', height: '4px', background: '#667eea', borderRadius: '50%', animation: 'pulse 1.4s infinite 0.2s'}} />
                  <span style={{width: '4px', height: '4px', background: '#667eea', borderRadius: '50%', animation: 'pulse 1.4s infinite 0.4s'}} />
                </span>
              </div>
            )}
          </div>
          {/* Quick Replies */}
          {showQuickReplies && msgs.length > 0 && (
            <div style={{display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid #374151'}}>
              {['👍 Okay', '⏰ ETA?', '📍 Location', '❓ Help'].map(reply => (
                <button
                  key={reply}
                  onClick={() => { setInput(reply); setShowQuickReplies(false) }}
                  style={{padding: '4px 10px', background: '#374151', color: '#d1d5db', border: '1px solid #4b5563', borderRadius: '12px', cursor: 'pointer', fontSize: '11px', fontWeight: '600', transition: 'all 0.2s'}}
                  onMouseOver={e => { (e.target as HTMLButtonElement).style.background = '#4b5563' }}
                  onMouseOut={e => { (e.target as HTMLButtonElement).style.background = '#374151' }}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
          {/* Chat Input */}
          <div style={{paddingTop: '12px', borderTop: '1px solid #1f2937'}}>
            <div style={{display: 'flex', gap: '8px', alignItems: 'flex-end'}}>
              <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: '6px'}}>
                <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                  <input
                    type="text"
                    placeholder="💬 Message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                    style={{width: '100%', padding: '6px 35px 6px 10px', border: '1px solid #374151', borderRadius: '6px', background: '#1f2937', color: '#f3f4f6', fontSize: '12px', boxSizing: 'border-box'}}
                  />
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '2px'}}
                    title="Add emoji"
                  >
                    😊
                  </button>
                </div>
                {showEmojiPicker && (
                  <div style={{position: 'absolute', bottom: '60px', left: '10px', background: '#374151', border: '1px solid #4b5563', borderRadius: '8px', padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '5px', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.3)'}}>
                    {['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱', '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖', '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤏', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '🤝', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🧓', '👴', '👵', '🙍', '🙎', '🙅', '🙆', '💁', '🙋', '🧏', '🙇', '🤦', '🤷', '👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓', '👨‍🏫', '👩‍🏫', '👨‍⚖️', '👩‍⚖️', '👨‍🌾', '👩‍🌾', '👨‍🍳', '👩‍🍳', '👨‍🔧', '👩‍🔧', '👨‍🏭', '👩‍🏭', '👨‍💼', '👩‍💼', '👨‍🔬', '👩‍🔬', '👨‍💻', '👩‍💻', '👨‍🎤', '👩‍🎤', '👨‍🎨', '👩‍🎨', '👨‍✈️', '👩‍✈️', '👨‍🚀', '👩‍🚀', '👨‍🚒', '👩‍🚒', '👮', '🕵️', '💂', '👷', '🤴', '👸', '🤴', '👸', '🤴', '👸', '🤴', '👸', '🦸', '🦹', '🥷', '🤶', '🎅', '🧑‍🎄', '🧙', '🧚', '🧛', '🧜', '🧝', '🧞', '🧟', '💆', '💇', '🚶', '🧍', '🧎', '🏃', '💃', '🕺', '🕴️', '👯', '🧖', '🧗', '🤺', '🏇', '⛷️', '🏂', '🏌️', '🏄', '🚣', '🏊', '⛹️', '🏋️', '🚴', '🚵', '🤸', '🤼', '🤽', '🤾', '🤹', '🧘', '🛀', '🛌', '🧑‍🤝‍🧑', '👭', '👫', '👬', '💏', '💑', '👪', '🗣️', '👤', '👥', '🫂', '👣'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => addEmoji(emoji)}
                      style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '2px', borderRadius: '4px'}}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#4b5563'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      {emoji}
                    </button>
                  ))}
                  </div>
                )}
                <div style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                  <input
                    type="text"
                    placeholder="� Link"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    style={{flex: 1, padding: '6px 8px', border: '1px solid #374151', borderRadius: '4px', background: '#1f2937', color: '#f3f4f6', fontSize: '11px', boxSizing: 'border-box'}}
                  />
                  <label style={{cursor: 'pointer', padding: '6px 8px', background: '#374151', color: '#9ca3af', borderRadius: '4px', fontSize: '11px', border: '1px solid #4b5563', display: 'flex', alignItems: 'center', gap: '3px'}}>
                    <span style={{fontSize: '16px'}}></span>
                    {uploadedFile ? uploadedFile.name : 'Choose File'}
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      capture="environment"
                      onChange={onFileChange}
                      style={{display: 'none'}}
                    />
                  </label>
                </div>
              </div>
              <button onClick={send} style={{padding: '8px 12px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '600', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap'}}>
                📤 Send
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Modal Popup */}
      {showImageModal && selectedImage && (
        <div style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999}}>
          <div style={{position: 'relative', maxWidth: '90vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            {/* Close Button */}
            <button
              onClick={() => { setShowImageModal(false); setSelectedImage(null) }}
              style={{position: 'absolute', top: '-40px', right: 0, background: '#667eea', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000}}
            >
              ✕
            </button>
            
            {/* Image */}
            <img
              src={selectedImage}
              alt="expanded"
              style={{maxWidth: '90vw', maxHeight: '85vh', borderRadius: '12px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'}}
            />
            
            {/* Image Info */}
            <div style={{marginTop: '16px', display: 'flex', gap: '12px', justifyContent: 'center'}}>
              <button
                onClick={() => window.open(selectedImage, '_blank')}
                style={{padding: '10px 16px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'}}
              >
                🔗 Open in New Tab
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = selectedImage
                  link.download = `image-${Date.now()}.jpg`
                  link.click()
                }}
                style={{padding: '10px 16px', background: '#8b5cf6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px'}}
              >
                ⬇️ Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
