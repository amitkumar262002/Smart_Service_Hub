import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { BookingsAPI, ChatsAPI } from '@/api/client'
import { useI18n } from '@/i18n'
import MapView from '@/components/MapView'

type LiveLoc = { lat: number; lng: number }

export default function TrackingAdvanced() {
  const { bookingId } = useParams()
  const [loc, setLoc] = useState<LiveLoc | null>(null)
  const [userLoc, setUserLoc] = useState<LiveLoc | null>(null)
  const [status, setStatus] = useState<'accepted' | 'on_the_way' | 'nearby' | 'completed' | string>('accepted')
  const [etaMin, setEtaMin] = useState<number | null>(null)
  const [distanceKm, setDistanceKm] = useState<number | null>(null)
  const [progress, setProgress] = useState(0)
  const [msgs, setMsgs] = useState<Array<{ id: string; sender: string; text: string; image_url?: string | null; createdAt?: string }>>([])
  const [input, setInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const { t } = useI18n()
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000)
  const [trackingHistory, setTrackingHistory] = useState<LiveLoc[]>([])
  const [speed, setSpeed] = useState<number | null>(null)
  const [bearing, setBearing] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const geoWatchRef = useRef<number | null>(null)

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Calculate bearing between two points
  const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const dLng = (lng2 - lng1) * Math.PI / 180
    const lat1Rad = lat1 * Math.PI / 180
    const lat2Rad = lat2 * Math.PI / 180
    const y = Math.sin(dLng) * Math.cos(lat2Rad)
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
  }

  async function refreshLocation() {
    if (!bookingId) return
    try {
      const res = await BookingsAPI.track(bookingId)
      const newLoc = res.provider_location
      
      // Update tracking history
      if (newLoc) {
        setTrackingHistory(prev => [...prev.slice(-99), newLoc])
        
        // Calculate speed if we have previous location
        if (loc) {
          const dist = calculateDistance(loc.lat, loc.lng, newLoc.lat, newLoc.lng)
          const timeInHours = refreshInterval / (1000 * 60 * 60)
          const calculatedSpeed = dist / timeInHours
          setSpeed(calculatedSpeed)
          
          // Calculate bearing
          const calculatedBearing = calculateBearing(loc.lat, loc.lng, newLoc.lat, newLoc.lng)
          setBearing(calculatedBearing)
        }
      }
      
      setLoc(newLoc)
      if (res.user_location) {
        setUserLoc({ lat: res.user_location.lat, lng: res.user_location.lng })
      }
      if (typeof res.progress === 'number') setProgress(res.progress)
      if (typeof res.eta_minutes === 'number') setEtaMin(res.eta_minutes)
      if (typeof res.distance_km === 'number') setDistanceKm(res.distance_km)
      if (res.status) setStatus(res.status)
      setLastUpdated(new Date().toLocaleTimeString('en-IN'))
    } catch (err) {
      console.error('Failed to refresh location:', err)
    }
  }

  // Auto-refresh location
  useEffect(() => {
    if (!bookingId) return
    refreshLocation()
    
    if (autoRefresh) {
      intervalRef.current = setInterval(refreshLocation, refreshInterval)
    }
    
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [bookingId, autoRefresh, refreshInterval])

  // Real-time geolocation tracking
  useEffect(() => {
    if (!('geolocation' in navigator)) return
    
    const successCallback = (pos: GeolocationPosition) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setUserLoc(coords)
      if (bookingId) {
        BookingsAPI.updateCustomerLocation(bookingId, coords).catch(() => {})
      }
    }

    const errorCallback = () => {}

    // Watch position for real-time updates
    geoWatchRef.current = navigator.geolocation.watchPosition(successCallback, errorCallback, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000
    })

    return () => {
      if (geoWatchRef.current) navigator.geolocation.clearWatch(geoWatchRef.current)
    }
  }, [bookingId])

  // Chat messages
  useEffect(() => {
    if (!bookingId) return
    let mounted = true
    async function load() {
      const list = await ChatsAPI.list(bookingId!)
      if (!mounted) return
      setMsgs(list)
    }
    load()
    const id = setInterval(load, 5000)
    return () => { mounted = false; clearInterval(id) }
  }, [bookingId])

  async function send() {
    if (!bookingId) return
    const text = input.trim()
    const img = imageUrl.trim()
    if (!text && !img) return
    const msg = await ChatsAPI.send(bookingId, text, 'customer', img || undefined)
    setMsgs(m => [...m, msg])
    setInput('')
    setImageUrl('')
  }

  async function onFileChange(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
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
    if (status === 'completed') return { bg: '#022c22', border: '#22c55e', color: '#22c55e' }
    if (status === 'nearby') return { bg: '#0f172a', border: '#fbbf24', color: '#fbbf24' }
    if (status === 'on_the_way') return { bg: '#0f172a', border: '#38bdf8', color: '#38bdf8' }
    return { bg: '#020617', border: '#4b5563', color: '#888' }
  }

  const tone = statusTone()
  const progressPct = Math.round(Math.min(1, Math.max(0, progress)) * 100)

  const directionsLink = loc && userLoc
    ? `https://www.google.com/maps/dir/?api=1&origin=${loc.lat},${loc.lng}&destination=${userLoc.lat},${userLoc.lng}`
    : (loc ? `https://www.google.com/maps?q=${loc.lat},${loc.lng}` : '#')

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '20px' }}>🗺️ Live Tracking</h2>

      {loc ? (
        <>
          {/* Status Card */}
          <div className="card" style={{
            background: `linear-gradient(135deg, ${tone.color}30 0%, ${tone.color}10 100%)`,
            borderLeft: `4px solid ${tone.color}`,
            marginBottom: '20px'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '32px' }}>
                    {status === 'completed' ? '✓' : status === 'on_the_way' ? '🚗' : status === 'nearby' ? '📍' : '📅'}
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: tone.color }}>
                      {statusLabel()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      Last updated: {lastUpdated}
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: '12px',
                  marginTop: '12px'
                }}>
                  {etaMin !== null && etaMin >= 0 && (
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>ETA</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>~{etaMin} min</div>
                    </div>
                  )}
                  {distanceKm !== null && (
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Distance</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{distanceKm.toFixed(1)} km</div>
                    </div>
                  )}
                  {speed !== null && (
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Speed</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{speed.toFixed(1)} km/h</div>
                    </div>
                  )}
                  {bearing !== null && (
                    <div style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#888', marginBottom: '4px' }}>Direction</div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{bearing.toFixed(0)}°</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className="btn"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  style={{
                    background: autoRefresh ? '#22c55e' : '#666',
                    color: '#fff',
                    fontWeight: 'bold'
                  }}
                >
                  {autoRefresh ? '⏸ Auto' : '▶ Manual'}
                </button>
                <button className="btn" onClick={refreshLocation}>
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', color: '#888' }}>Journey Progress</div>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: tone.color }}>{progressPct}%</div>
              </div>
              <div style={{
                height: '8px',
                borderRadius: '999px',
                background: '#333',
                overflow: 'hidden',
                border: `1px solid ${tone.color}30`
              }}>
                <div style={{
                  width: `${progressPct}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${tone.color}, ${tone.color}80)`,
                  transition: 'width 0.3s ease'
                }} />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="card" style={{ marginBottom: '20px', minHeight: '400px' }}>
            <div className="card-title">📍 Live Map</div>
            <div style={{ marginTop: '12px', borderRadius: '8px', overflow: 'hidden', minHeight: '350px' }}>
              <MapView provider={loc} user={userLoc} />
            </div>
          </div>

          {/* Location Details */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div className="card">
              <div className="card-title">📍 Provider Location</div>
              <div style={{ marginTop: '12px', fontSize: '13px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#888' }}>Latitude:</span> {loc.lat.toFixed(6)}
                </div>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ color: '#888' }}>Longitude:</span> {loc.lng.toFixed(6)}
                </div>
                <div style={{ marginTop: '12px' }}>
                  <a href={directionsLink} target="_blank" rel="noreferrer" className="btn" style={{ display: 'block', textAlign: 'center' }}>
                    📍 Open in Google Maps
                  </a>
                </div>
              </div>
            </div>

            {userLoc && (
              <div className="card">
                <div className="card-title">📍 Your Location</div>
                <div style={{ marginTop: '12px', fontSize: '13px' }}>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ color: '#888' }}>Latitude:</span> {userLoc.lat.toFixed(6)}
                  </div>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ color: '#888' }}>Longitude:</span> {userLoc.lng.toFixed(6)}
                  </div>
                  <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '6px', color: '#22c55e', fontSize: '12px' }}>
                    ✓ Real-time location enabled
                  </div>
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-title">⚙️ Tracking Settings</div>
              <div style={{ marginTop: '12px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#888', display: 'block', marginBottom: '4px' }}>
                    Refresh Interval
                  </label>
                  <select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '6px',
                      borderRadius: '4px',
                      border: '1px solid #333',
                      background: '#111',
                      color: '#fff'
                    }}
                  >
                    <option value={3000}>3 seconds</option>
                    <option value={5000}>5 seconds</option>
                    <option value={10000}>10 seconds</option>
                    <option value={30000}>30 seconds</option>
                  </select>
                </div>
                <div style={{ padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', color: '#3b82f6', fontSize: '12px' }}>
                  📡 Live tracking active
                </div>
              </div>
            </div>
          </div>

          {/* Chat Section - Advanced */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(139, 92, 246, 0.05))',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '16px',
              borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))'
            }}>
              <div className="card-title" style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                💬 Live Chat with Provider
              </div>
              <div style={{ fontSize: '11px', color: '#888', marginTop: '4px' }}>
                Real-time messaging • Share images & links
              </div>
            </div>

            {/* Messages Container */}
            <div style={{
              marginTop: '0px',
              maxHeight: '350px',
              overflowY: 'auto',
              padding: '16px',
              background: 'rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {msgs.length === 0 && (
                <div style={{
                  textAlign: 'center',
                  color: '#888',
                  fontSize: '13px',
                  padding: '24px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  border: '1px dashed rgba(255,255,255,0.1)'
                }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>💭</div>
                  No messages yet. Start the conversation!
                </div>
              )}
              {msgs.map(m => (
                <div
                  key={m.id}
                  style={{
                    display: 'flex',
                    justifyContent: m.sender === 'customer' ? 'flex-end' : 'flex-start',
                    animation: 'slideIn 0.3s ease-out'
                  }}
                >
                  <div style={{
                    maxWidth: '70%',
                    padding: '12px 14px',
                    background: m.sender === 'customer'
                      ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                      : 'rgba(255,255,255,0.08)',
                    borderRadius: m.sender === 'customer' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    fontSize: '13px',
                    lineHeight: '1.4',
                    wordBreak: 'break-word',
                    boxShadow: m.sender === 'customer'
                      ? '0 4px 12px rgba(59, 130, 246, 0.3)'
                      : '0 2px 8px rgba(0,0,0,0.2)',
                    border: m.sender === 'customer'
                      ? 'none'
                      : '1px solid rgba(255,255,255,0.1)'
                  }}>
                    <div style={{
                      color: m.sender === 'customer' ? '#fff' : '#888',
                      fontSize: '10px',
                      marginBottom: '4px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {m.sender === 'customer' ? '👤 You' : '🔧 Provider'}
                    </div>
                    <div style={{ color: m.sender === 'customer' ? '#fff' : '#ddd' }}>
                      {m.text}
                    </div>
                    {m.image_url && (
                      <div style={{
                        marginTop: '8px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        maxWidth: '100%'
                      }}>
                        <img
                          src={m.image_url}
                          alt="Message attachment"
                          loading="lazy"
                          decoding="async"
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            maxHeight: '120px',
                            display: 'block',
                            borderRadius: '6px',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    )}
                    <div style={{
                      fontSize: '9px',
                      color: m.sender === 'customer' ? 'rgba(255,255,255,0.6)' : '#666',
                      marginTop: '4px'
                    }}>
                      {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input Section */}
            <div style={{
              padding: '16px',
              background: 'rgba(0,0,0,0.3)',
              borderTop: '1px solid rgba(59, 130, 246, 0.1)',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              <input
                className="input"
                placeholder="📝 Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && send()}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px'
                }}
              />
              <input
                type="text"
                placeholder="🔗 Paste link/photo URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && send()}
                style={{
                  flex: 1,
                  minWidth: '200px',
                  padding: '10px 14px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '13px'
                }}
              />
              <button
                className="btn"
                onClick={send}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                ✈️ Send
              </button>
            </div>

            <style>{`
              @keyframes slideIn {
                from {
                  opacity: 0;
                  transform: translateY(10px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
            `}</style>
          </div>
        </>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📍</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>Loading tracking data...</div>
          <div style={{ color: '#888' }}>Please wait while we fetch the provider's location</div>
        </div>
      )}
    </div>
  )
}
