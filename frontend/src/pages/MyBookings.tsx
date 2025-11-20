import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UsersAPI } from '@/api/client'
import { getSessionUserId } from '@/auth'

type Booking = {
  id: string
  status: string
  amount?: number
  datetime?: string
  createdAt?: string
  service_title?: string
  provider_name?: string
  rating?: number
  provider_id?: string
  service_id?: string
}

const STATUS_ORDER: Record<string, number> = {
  pending: 1,
  confirmed: 2,
  scheduled: 3,
  accepted: 4,
  on_the_way: 5,
  nearby: 6,
  completed: 7,
  cancelled: 8,
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all')
  const [sortBy, setSortBy] = useState<'date' | 'price'>('date')
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list')
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null)
  const nav = useNavigate()

  useEffect(() => {
    const userId = getSessionUserId()
    if (!userId) {
      setLoading(false)
      return
    }
    ;(async () => {
      try {
        const list: any[] = await UsersAPI.bookings(userId)
        const mapped: Booking[] = list.map(b => ({
          id: b.id,
          status: b.status,
          amount: b.service_price,
          datetime: b.datetime,
          createdAt: b.createdAt,
          service_title: b.service_title,
          provider_name: b.provider_name,
          rating: b.rating,
          provider_id: b.provider_id,
          service_id: b.service_id,
        }))
        mapped.sort((a, b) => {
          const sa = STATUS_ORDER[(a.status || '').toLowerCase()] || 99
          const sb = STATUS_ORDER[(b.status || '').toLowerCase()] || 99
          if (sa !== sb) return sa - sb
          const ta = a.createdAt || a.datetime || ''
          const tb = b.createdAt || b.datetime || ''
          return (tb || '').localeCompare(ta || '')
        })
        setBookings(mapped)
        
        // Show success popup for newest booking if it's recent
        if (mapped.length > 0) {
          const newest = mapped[0]
          const createdTime = newest.createdAt ? new Date(newest.createdAt).getTime() : 0
          const now = Date.now()
          const diffSeconds = (now - createdTime) / 1000
          
          // Show popup if booking was created within last 10 seconds
          if (diffSeconds < 10 && newest.status && ['pending', 'confirmed'].includes(newest.status.toLowerCase())) {
            setSuccessBooking(newest)
            setShowSuccessPopup(true)
            // Auto-hide after 5 seconds
            setTimeout(() => setShowSuccessPopup(false), 5000)
          }
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const visible = useMemo(() => {
    let filtered = bookings
    if (statusFilter === 'all') {
      filtered = bookings
    } else if (statusFilter === 'upcoming') {
      filtered = bookings.filter(b => ['pending', 'confirmed', 'scheduled', 'accepted', 'on_the_way', 'nearby'].includes((b.status || '').toLowerCase()))
    } else if (statusFilter === 'completed') {
      filtered = bookings.filter(b => ['completed', 'finished'].includes((b.status || '').toLowerCase()))
    } else if (statusFilter === 'cancelled') {
      filtered = bookings.filter(b => ['cancelled', 'canceled'].includes((b.status || '').toLowerCase()))
    }

    if (sortBy === 'price') {
      filtered = [...filtered].sort((a, b) => (b.amount || 0) - (a.amount || 0))
    }

    return filtered
  }, [bookings, statusFilter, sortBy])

  const stats = useMemo(() => {
    const total = bookings.length
    const completed = bookings.filter(b => ['completed', 'finished'].includes((b.status || '').toLowerCase())).length
    const upcoming = bookings.filter(b => ['pending', 'confirmed', 'scheduled', 'accepted', 'on_the_way', 'nearby'].includes((b.status || '').toLowerCase())).length
    const cancelled = bookings.filter(b => ['cancelled', 'canceled'].includes((b.status || '').toLowerCase())).length
    const totalSpent = bookings.reduce((sum, b) => sum + (b.amount || 0), 0)
    const avgRating = bookings.filter(b => b.rating).length > 0
      ? (bookings.reduce((sum, b) => sum + (b.rating || 0), 0) / bookings.filter(b => b.rating).length)
      : 0

    return { total, completed, upcoming, cancelled, totalSpent, avgRating }
  }, [bookings])

  function toBadge(status: string) {
    const s = (status || '').toLowerCase()
    if (['completed', 'finished'].includes(s)) return { label: '✓ Completed', icon: '✓', tone: '#022c22', border: '#22c55e', color: '#22c55e' }
    if (['pending', 'confirmed'].includes(s)) return { label: '⏳ Pending', icon: '⏳', tone: '#332701', border: '#f59e0b', color: '#f59e0b' }
    if (['scheduled', 'accepted'].includes(s)) return { label: '📅 Scheduled', icon: '📅', tone: '#111827', border: '#3b82f6', color: '#3b82f6' }
    if (['on_the_way', 'nearby'].includes(s)) return { label: '🚗 On the way', icon: '🚗', tone: '#0f172a', border: '#38bdf8', color: '#38bdf8' }
    if (['cancelled', 'canceled'].includes(s)) return { label: '✕ Cancelled', icon: '✕', tone: '#450a0a', border: '#f87171', color: '#f87171' }
    return { label: status || 'Unknown', icon: '•', tone: '#020617', border: '#4b5563', color: '#888' }
  }

  const getStatusIcon = (status: string) => {
    const s = (status || '').toLowerCase()
    if (['completed', 'finished'].includes(s)) return '✓'
    if (['pending', 'confirmed'].includes(s)) return '⏳'
    if (['scheduled', 'accepted'].includes(s)) return '📅'
    if (['on_the_way', 'nearby'].includes(s)) return '🚗'
    if (['cancelled', 'canceled'].includes(s)) return '✕'
    return '•'
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Success Popup */}
      {showSuccessPopup && successBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            width: '90%',
            color: '#fff',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            animation: 'slideUp 0.4s ease'
          }}>
            {/* Success Icon */}
            <div style={{
              fontSize: '64px',
              marginBottom: '20px',
              animation: 'bounce 0.6s ease'
            }}>
              🎉
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 12px 0',
              letterSpacing: '-0.5px'
            }}>
              Congratulations!
            </h1>

            {/* Message */}
            <p style={{
              fontSize: '16px',
              margin: '0 0 20px 0',
              opacity: 0.95,
              lineHeight: '1.6'
            }}>
              Your booking has been successfully created! 🎊
            </p>

            {/* Booking Details Card */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <div style={{ opacity: 0.8, marginBottom: '4px' }}>Service</div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>{successBooking.service_title || 'Service'}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.8, marginBottom: '4px' }}>Amount</div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>₹{(successBooking.amount || 0).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <div style={{ opacity: 0.8, marginBottom: '4px' }}>Booking ID</div>
                  <div style={{ fontWeight: '600', fontSize: '12px', fontFamily: 'monospace' }}>{successBooking.id.slice(0, 8)}...</div>
                </div>
                <div>
                  <div style={{ opacity: 0.8, marginBottom: '4px' }}>Status</div>
                  <div style={{ fontWeight: '600', fontSize: '14px', textTransform: 'capitalize' }}>
                    {successBooking.status === 'pending' ? '⏳ Pending' : '✓ Confirmed'}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '24px',
              fontSize: '13px',
              lineHeight: '1.8'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px' }}>📋 Next Steps:</div>
              <div>✓ Complete payment to confirm</div>
              <div>✓ Provider will accept your booking</div>
              <div>✓ Track provider in real-time</div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => nav(`/pay/${successBooking.id}`)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: '#fff',
                  color: '#059669',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                💳 Pay Now
              </button>
              <button
                onClick={() => setShowSuccessPopup(false)}
                style={{
                  flex: 1,
                  padding: '12px 20px',
                  background: 'rgba(255,255,255,0.2)',
                  color: '#fff',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
                onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              >
                ✓ Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header with Advanced Features */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        color: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '20px' }}>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700' }}>📅 My Bookings</h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Manage and track all your service bookings</p>
          </div>
          <button
            onClick={() => nav('/search')}
            style={{
              padding: '10px 20px',
              background: '#fff',
              color: '#667eea',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={e => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            ➕ New Booking
          </button>
        </div>

        {/* Quick Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginTop: '16px' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Bookings</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>{stats.total}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Upcoming</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>{stats.upcoming}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Completed</div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginTop: '4px' }}>{stats.completed}</div>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: '12px', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>Total Spent</div>
            <div style={{ fontSize: '18px', fontWeight: '700', marginTop: '4px' }}>₹{stats.totalSpent.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid #333',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {(['list', 'stats'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              background: activeTab === tab ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: activeTab === tab ? '#3b82f6' : '#888',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 400,
              transition: 'all 0.2s ease'
            }}
          >
            {tab === 'list' && '📋 Bookings'}
            {tab === 'stats' && '📊 Statistics'}
          </button>
        ))}
      </div>

      {/* Statistics Tab */}
      {activeTab === 'stats' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Bookings</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total}</div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Completed</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.completed}</div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Upcoming</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.upcoming}</div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Spent</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{stats.totalSpent.toLocaleString('en-IN')}</div>
            </div>
            {stats.avgRating > 0 && (
              <div className="card" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#000' }}>
                <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '8px' }}>Avg Rating</div>
                <div style={{ fontSize: '28px', fontWeight: 'bold' }}>⭐ {stats.avgRating.toFixed(1)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings List Tab */}
      {activeTab === 'list' && (
        <div>
          {/* Filters */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-title">🔍 Filters & Sort</div>
            <div style={{ marginTop: '12px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Status</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        background: statusFilter === s ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                        color: statusFilter === s ? '#3b82f6' : '#888',
                        cursor: 'pointer',
                        fontWeight: statusFilter === s ? 'bold' : 'normal',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '6px' }}>Sort By</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {(['date', 'price'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSortBy(s)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        background: sortBy === s ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255,255,255,0.05)',
                        color: sortBy === s ? '#3b82f6' : '#888',
                        cursor: 'pointer',
                        fontWeight: sortBy === s ? 'bold' : 'normal',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {s === 'date' ? '📅 Date' : '💰 Price'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bookings */}
          {loading && (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: '#888' }}>Loading bookings...</div>
            </div>
          )}

          {!loading && visible.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>No bookings found</div>
              <div style={{ color: '#888', marginBottom: '16px' }}>Try a different filter or create a new booking</div>
              <button className="btn" onClick={() => nav('/search')}>Browse Services</button>
            </div>
          )}

          {visible.map(b => {
            const badge = toBadge(b.status)
            const when = b.datetime || b.createdAt || ''
            const dt = when ? new Date(when) : null
            const whenLabel = dt ? dt.toLocaleDateString('en-IN') : when
            const timeLabel = dt ? dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''
            const isPending = (b.status || '').toLowerCase() === 'pending'
            const canTrack = ['accepted', 'on_the_way', 'nearby'].includes((b.status || '').toLowerCase())
            const isCompleted = ['completed', 'finished'].includes((b.status || '').toLowerCase())

            return (
              <div
                key={b.id}
                className="card"
                style={{
                  marginBottom: '12px',
                  borderLeft: `4px solid ${badge.color}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(4px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <div style={{ fontSize: '20px' }}>{getStatusIcon(b.status)}</div>
                      <div>
                        <div className="card-title" style={{ margin: 0 }}>{b.service_title || 'Service'}</div>
                        <div className="card-sub" style={{ fontSize: '12px', margin: '2px 0' }}>
                          Provider: {b.provider_name || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginTop: '8px' }}>
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        📅 {whenLabel} {timeLabel && `at ${timeLabel}`}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>
                        ₹{(b.amount || 0).toLocaleString('en-IN')}
                      </div>
                      {b.rating && (
                        <div style={{ fontSize: '14px', color: '#fbbf24' }}>
                          ⭐ {b.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                  </div>

                  <span
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      background: badge.tone,
                      color: badge.color,
                      border: `1px solid ${badge.color}`,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {badge.label}
                  </span>
                </div>

                {/* Action Buttons */}
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button className="btn" onClick={() => nav(`/booking/${b.id}`)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                    📋 Details
                  </button>
                  {isPending && (
                    <button className="btn" onClick={() => nav(`/pay/${b.id}`)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                      💳 Pay Now
                    </button>
                  )}
                  {canTrack && (
                    <button className="btn" onClick={() => nav(`/track/${b.id}`)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                      🗺️ Track Live
                    </button>
                  )}
                  {isCompleted && !b.rating && (
                    <button className="btn" onClick={() => nav(`/booking/${b.id}`)} style={{ fontSize: '12px', padding: '6px 12px' }}>
                      ⭐ Rate Service
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
