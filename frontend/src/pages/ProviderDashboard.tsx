import { useEffect, useState } from 'react'
import { ProvidersAPI, SubscriptionsAPI, ChatsAPI, BookingsAPI } from '@/api/client'
import ProviderCard from '@/components/ProviderCard'
import { COLORS, SPACING, RADIUS, SHADOWS, TRANSITIONS } from '@/styles/theme'

export default function ProviderDashboard() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string|undefined>()
  const [plans, setPlans] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [chatBookingId, setChatBookingId] = useState('')
  const [chatMsgs, setChatMsgs] = useState<{id:string; sender:string; text:string; image_url?: string|null; createdAt?:string}[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatImageUrl, setChatImageUrl] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [recentChats, setRecentChats] = useState<any[]>([])
  const [stats, setStats] = useState<any|null>(null)
  const [gpsBookingId, setGpsBookingId] = useState('')
  const [gpsStatus, setGpsStatus] = useState<string|undefined>()
  const [gpsLoading, setGpsLoading] = useState(false)
  const [isCalling, setIsCalling] = useState(false)
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const retryLoadData = async () => {
    setLoading(true)
    setErr(undefined)
    setRetryCount(prev => prev + 1)
    
    try {
      const providersList = await ProvidersAPI.list()
      setProviders(providersList || [])
      setErr(undefined)
    } catch (e: any) {
      const errorMsg = e?.response?.data?.message || e?.message || 'Failed to load providers. Make sure backend API is running on http://localhost:5000'
      setErr(errorMsg)
      setProviders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    retryLoadData()
    
    // Load other data without blocking
    SubscriptionsAPI.plans()
      .then(setPlans)
      .catch(() => setPlans([]))
    
    ChatsAPI.recent()
      .then(setRecentChats)
      .catch(() => setRecentChats([]))
  }, [])

  useEffect(() => {
    if (!providers.length) return
    const first = providers[0]
    if (!first?.id) return
    ProvidersAPI.bookings(first.id)
      .then(res => setStats(res.stats))
      .catch(()=>{})
  }, [providers])

  async function choosePlan(providerId: string, planId: string) {
    setSaving(true)
    try {
      const updated = await SubscriptionsAPI.subscribe(providerId, planId)
      setProviders(prev => prev.map(p => p.id === updated.id ? updated : p))
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!chatBookingId) return
    let mounted = true
    async function load() {
      try {
        const list = await ChatsAPI.list(chatBookingId)
        if (!mounted) return
        setChatMsgs(list)
      } catch {
        // ignore for now
      }
    }
    load()
    const id = window.setInterval(load, 5000)
    return () => { mounted = false; window.clearInterval(id) }
  }, [chatBookingId])

  async function sendChat() {
    const bid = chatBookingId.trim()
    const text = chatInput.trim()
    const img = chatImageUrl.trim()
    if (!bid || (!text && !img)) return
    setChatLoading(true)
    try {
      const msg = await ChatsAPI.send(bid, text, 'provider', img || undefined)
      setChatMsgs(m => [...m, msg])
      setChatInput('')
      setChatImageUrl('')
    } finally {
      setChatLoading(false)
    }
  }

  async function onChatFileChange(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const url = typeof reader.result === 'string' ? reader.result : ''
      if (url) setChatImageUrl(url)
    }
    reader.readAsDataURL(file)
  }

  function updateGpsFromBrowser() {
    const bid = gpsBookingId.trim()
    if (!bid) {
      setGpsStatus('Enter a booking ID first.')
      return
    }
    if (!('geolocation' in navigator)) {
      setGpsStatus('Geolocation not supported in this browser.')
      return
    }
    setGpsLoading(true)
    setGpsStatus(undefined)
    navigator.geolocation.getCurrentPosition(async pos => {
      try {
        await BookingsAPI.updateLocation(bid, {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        })
        setGpsStatus('Location updated for booking ' + bid)
      } catch (e:any) {
        setGpsStatus('Failed to update location: ' + (e?.message || 'Unknown error'))
      } finally {
        setGpsLoading(false)
      }
    }, err => {
      setGpsLoading(false)
      setGpsStatus('Location error: ' + (err?.message || 'Permission denied'))
    })
  }

  const handleStartCall = async (type: 'audio' | 'video') => {
    setCallType(type)
    setIsCalling(true)
    // WebRTC logic will be implemented here
  }

  const handleEndCall = () => {
    setIsCalling(false)
    setCallType(null)
    // Cleanup WebRTC connections
  }

  return (
    <div style={{ padding: SPACING.lg, background: '#0f172a', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ marginBottom: SPACING.xxxl }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: '#f1f5f9', marginBottom: SPACING.md }}>
          📊 Provider Dashboard
        </h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px' }}>
          Manage your services, bookings, and customer interactions
        </p>
      </div>

      {/* Stats Section */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: SPACING.lg,
          marginBottom: SPACING.xxxl
        }}>
          {[
            { label: 'Today Bookings', value: stats.today_bookings, icon: '📅', color: COLORS.primary },
            { label: 'Active Jobs', value: stats.active, icon: '⚡', color: COLORS.success },
            { label: 'Completed', value: stats.completed, icon: '✓', color: COLORS.info },
            { label: 'Total Earnings', value: `₹${stats.total_earnings}`, icon: '💰', color: COLORS.warning }
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              padding: SPACING.lg,
              borderRadius: RADIUS.xl,
              border: `1px solid ${COLORS.primary}20`,
              boxShadow: SHADOWS.md,
              transition: TRANSITIONS.base,
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = SHADOWS.lg
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = SHADOWS.md
            }}>
              <div style={{ fontSize: '24px', marginBottom: SPACING.sm }}>{stat.icon}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: SPACING.xs }}>
                {stat.label}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: stat.color }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
          padding: SPACING.xxxl,
          borderRadius: RADIUS.xl,
          textAlign: 'center',
          border: `1px solid ${COLORS.primary}20`,
          boxShadow: SHADOWS.md
        }}>
          <div style={{ fontSize: '32px', marginBottom: SPACING.lg, animation: 'pulse 1.5s infinite' }}>
            ⏳
          </div>
          <div style={{ color: '#cbd5e1', fontSize: '16px', fontWeight: '600' }}>
            Loading providers…
          </div>
          <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: SPACING.sm }}>
            Please wait while we fetch your data
          </div>
        </div>
      )}

      {/* Error State */}
      {err && !loading && (
        <div style={{
          background: '#dc262620',
          border: `2px solid ${COLORS.danger}`,
          borderRadius: RADIUS.xl,
          padding: SPACING.lg,
          marginBottom: SPACING.lg,
          boxShadow: SHADOWS.md
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: SPACING.lg }}>
            <div style={{ fontSize: '32px' }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: '#fca5a5', fontSize: '16px', fontWeight: '600', marginBottom: SPACING.sm }}>
                Network Error
              </h3>
              <p style={{ margin: 0, color: '#fca5a5', fontSize: '13px', lineHeight: '1.5', marginBottom: SPACING.md }}>
                {err}
              </p>
              <div style={{ display: 'flex', gap: SPACING.md, flexWrap: 'wrap' }}>
                <button
                  onClick={retryLoadData}
                  style={{
                    padding: `${SPACING.sm} ${SPACING.lg}`,
                    background: COLORS.danger,
                    color: '#fff',
                    border: 'none',
                    borderRadius: RADIUS.md,
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    transition: TRANSITIONS.base,
                    boxShadow: SHADOWS.md
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = SHADOWS.lg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = SHADOWS.md
                  }}
                >
                  🔄 Retry ({retryCount})
                </button>
                <a
                  href="http://localhost:5000"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: `${SPACING.sm} ${SPACING.lg}`,
                    background: COLORS.info,
                    color: '#fff',
                    border: 'none',
                    borderRadius: RADIUS.md,
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '13px',
                    textDecoration: 'none',
                    transition: TRANSITIONS.base,
                    boxShadow: SHADOWS.md,
                    display: 'inline-block'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = SHADOWS.lg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = SHADOWS.md
                  }}
                >
                  🔗 Check Backend
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid-2" style={{marginTop:12, gap:16}}>
        <div>
          {providers.length > 0 && plans.length > 0 && (
            <div className="card">
              <div className="card-title">Upgrade a provider</div>
              <div className="card-sub">Select a plan to assign to the first provider (demo).</div>
              <div style={{marginTop:8, display:'flex', flexWrap:'wrap', gap:8}}>
                {plans.map(pl => (
                  <button
                    key={pl.id}
                    className="btn"
                    disabled={saving}
                    onClick={() => choosePlan(providers[0].id, pl.id)}
                  >
                    Set {providers[0].name || providers[0].id} to {pl.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          {recentChats.length > 0 && (
            <div className="card">
              <div className="card-title">Recent chats</div>
              <div className="card-sub">Quickly open last few booking conversations.</div>
              <div className="grid">
                {recentChats.map(rc => {
                  const ts = rc.lastAt ? new Date(rc.lastAt) : null
                  const time = ts ? ts.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : ''
                  const snippet = (rc.last_text || '').slice(0, 80) || (rc.last_image_url ? '[Photo sent]' : '') || 'No message text yet.'
                  return (
                    <button
                      key={rc.booking_id}
                      className="card"
                      style={{textAlign:'left', cursor:'pointer'}}
                      onClick={() => setChatBookingId(rc.booking_id)}
                    >
                      <div className="card-title">Booking {rc.booking_id}</div>
                      <div className="card-sub">{snippet}</div>
                      <div className="msg-meta" style={{marginTop:6}}>
                        {rc.last_sender || 'User'}{time ? ` · ${time}` : ''}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
          <div className="card" style={{marginTop:12, maxWidth:640, marginInline:'auto'}}>
            <div className="chat-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <h3 style={{margin: 0}}>Chat with customer</h3>
              {!isCalling && chatBookingId && (
                <div className="call-buttons" style={{display: 'flex', gap: '8px'}}>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => handleStartCall('audio')}
                    title="Start audio call"
                    style={{padding: '4px 8px'}}
                  >
                    📞
                  </button>
                  <button 
                    className="btn btn-sm" 
                    onClick={() => handleStartCall('video')}
                    title="Start video call"
                    style={{padding: '4px 8px'}}
                  >
                    📹
                  </button>
                </div>
              )}
            </div>
            <div className="card-sub">Enter a booking ID to see and reply in that booking&apos;s chat thread.</div>
            <div style={{marginTop:8, display:'flex', flexDirection:'column', gap:8}}>
              <input
                className="input"
                placeholder="Enter booking ID e.g. from customer or admin panel"
                value={chatBookingId}
                onChange={e => setChatBookingId(e.target.value)}
              />
              {chatBookingId && (
                <>
                  <div className="chat-thread" style={{background:'#020617',borderRadius:8,padding:8}}>
                    {chatMsgs.length === 0 && !chatLoading && (
                      <div className="muted">No messages yet for this booking.</div>
                    )}
                    {chatLoading && <div className="muted">Loading chat…</div>}
                    {chatMsgs.map(m => {
                      const isProvider = m.sender === 'provider'
                      const ts = m.createdAt ? new Date(m.createdAt) : null
                      const time = ts ? ts.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }) : ''
                      const label = isProvider ? 'You' : (m.sender === 'customer' ? 'Customer' : m.sender || 'User')
                      const url = (m.image_url || '').trim()
                      const isHttp = /^https?:\/\//i.test(url)
                      const isData = /^data:image\//i.test(url)
                      const isPdf = isHttp && /\.pdf(\?|$)/i.test(url)
                      return (
                        <div
                          key={m.id}
                          className={isProvider ? 'msg user' : 'msg assistant'}
                          style={{fontSize:13}}
                        >
                          {m.text && <div>{m.text}</div>}
                          {url && (
                            <div style={{marginTop:6}}>
                              {isHttp ? (
                                isPdf ? (
                                  <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn"
                                    style={{padding:'4px 8px', fontSize:11}}
                                  >
                                    View PDF
                                  </a>
                                ) : (
                                  <img
                                    src={url}
                                    alt="shared"
                                    style={{maxWidth:'100%',borderRadius:8,border:'1px solid #1f2937'}}
                                  />
                                )
                              ) : isData ? (
                                <img
                                  src={url}
                                  alt="shared"
                                  style={{maxWidth:'100%',borderRadius:8,border:'1px solid #1f2937'}}
                                />
                              ) : (
                                <span className="chip chip-sm" style={{background:'#020617',borderColor:'#4b5563'}}>
                                  Attachment: {url}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="msg-meta">{label}{time ? ` · ${time}` : ''}</div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="chat-input" style={{padding:8,paddingTop:8,borderTop:'1px solid #1f2937',background:'transparent',flexDirection:'column',gap:6}}>
                    <input
                      className="input"
                      placeholder="Type a reply to the customer…"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') sendChat() }}
                    />
                    <div style={{display:'flex',gap:6,flexWrap:'wrap',width:'100%'}}>
                      <input
                        className="input"
                        style={{flex:1,minWidth:0}}
                        placeholder="Optional: paste photo/PDF link…"
                        value={chatImageUrl}
                        onChange={e => setChatImageUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') sendChat() }}
                      />
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        capture="environment"
                        style={{flexBasis:'140px'}}
                        onChange={onChatFileChange}
                      />
                      <button className="btn" style={{whiteSpace:'nowrap'}} onClick={sendChat} disabled={chatLoading}>Send</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div>
          <div className="card">
            <div className="card-title">Live GPS update</div>
            <div className="card-sub">Update your real-time location for a specific booking ID. Customers will see this on the tracking map.</div>
            <div style={{marginTop:8, display:'flex', flexDirection:'column', gap:8}}>
              <input
                className="input"
                placeholder="Booking ID (e.g. copy from Admin or My Bookings)"
                value={gpsBookingId}
                onChange={e => setGpsBookingId(e.target.value)}
              />
              <button className="btn" type="button" onClick={updateGpsFromBrowser} disabled={gpsLoading}>
                {gpsLoading ? 'Updating location…' : 'Use my current location'}
              </button>
              {gpsStatus && (
                <div className="card-sub" style={{marginTop:4}}>{gpsStatus}</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {plans.length > 0 && (
        <div className="card" style={{marginTop:16}}>
          <div className="card-title">Subscription Plans</div>
          <div className="grid">
            {plans.map(pl => (
              <div key={pl.id} className="card">
                <div className="card-title">{pl.name}</div>
                <div className="card-sub">₹ {pl.price} / month</div>
                <ul>
                  {pl.features?.map((f: string) => <li key={f}>{f}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="grid" style={{marginTop:12}}>
        {providers.map(p => (
          <ProviderCard key={p.id} provider={p} />
        ))}
      </div>

      {/* Call UI */}
      {isCalling && callType && (
        <div className="call-ui" style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'var(--card-bg)',
          padding: '10px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}>
          <div style={{textAlign: 'center', marginBottom: '10px'}}>
            <h4>{callType === 'audio' ? 'Audio Call' : 'Video Call'}</h4>
            <p>Calling customer...</p>
          </div>
          <div style={{display: 'flex', justifyContent: 'center', gap: '10px'}}>
            <button 
              className="btn btn-sm btn-danger" 
              onClick={handleEndCall}
              style={{padding: '8px 16px'}}
            >
              End Call
            </button>
            <button 
              className="btn btn-sm"
              style={{padding: '8px 16px'}}
            >
              Mute
            </button>
          </div>
          {callType === 'video' && (
            <div style={{marginTop: '10px'}}>
              <video 
                id="localVideo" 
                autoPlay 
                playsInline 
                muted 
                style={{
                  width: '200px',
                  borderRadius: '4px',
                  background: '#000'
                }}
              />
              <video 
                id="remoteVideo" 
                autoPlay 
                playsInline 
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  borderRadius: '4px',
                  background: '#000',
                  marginTop: '10px'
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
