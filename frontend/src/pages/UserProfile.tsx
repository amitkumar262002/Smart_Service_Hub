import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { getSessionUserId, getSessionUser } from '@/auth'
import { useTheme } from '@/context/ThemeContext'
import { THEME, COLORS, SPACING, RADIUS, SHADOWS, TRANSITIONS } from '@/styles/theme'

type User = { id: string; name?: string; email?: string; phone?: string; role?: string; createdAt?: string; avatar?: string }
type Stats = { total_bookings: number; completed: number; upcoming: number; cancelled: number; total_spend: number; avg_rating?: number }
type Booking = { id: string; status: string; service_title?: string; service_price?: number; createdAt?: string; provider_name?: string; rating?: number }

export default function UserProfile() {
  const { isDark } = useTheme()
  const theme = isDark ? THEME.dark : THEME.light
  
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'analytics' | 'settings'>('overview')
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Partial<User>>({})
  const nav = useNavigate()
  const sessionUser = getSessionUser()

  // Calculate advanced analytics
  const getAnalytics = () => {
    if (!bookings.length) return null
    
    const categories: Record<string, number> = {}
    const monthlySpend: Record<string, number> = {}
    let totalRating = 0
    let ratedCount = 0
    
    bookings.forEach(b => {
      const cat = b.service_title?.split(' ')[0] || 'Other'
      categories[cat] = (categories[cat] || 0) + 1
      
      const month = b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }) : 'Unknown'
      monthlySpend[month] = (monthlySpend[month] || 0) + (b.service_price || 0)
      
      if (b.rating) {
        totalRating += b.rating
        ratedCount++
      }
    })
    
    return {
      categories,
      monthlySpend,
      avgRating: ratedCount > 0 ? (totalRating / ratedCount).toFixed(1) : 0,
      completionRate: stats ? ((stats.completed / stats.total_bookings) * 100).toFixed(0) : 0,
      avgBookingValue: stats ? (stats.total_spend / stats.total_bookings).toFixed(0) : 0
    }
  }

  const getAchievements = () => {
    const achievements = []
    if (stats?.total_bookings! >= 1) achievements.push({ icon: '🎯', label: 'First Booking', desc: 'Completed your first booking' })
    if (stats?.total_bookings! >= 5) achievements.push({ icon: '⭐', label: 'Regular', desc: '5+ bookings completed' })
    if (stats?.total_bookings! >= 10) achievements.push({ icon: '👑', label: 'Premium', desc: '10+ bookings completed' })
    if (stats?.completed! >= stats?.total_bookings! * 0.9) achievements.push({ icon: '✨', label: 'Reliable', desc: '90%+ completion rate' })
    if (stats?.total_spend! >= 5000) achievements.push({ icon: '💎', label: 'Big Spender', desc: '₹5000+ spent' })
    return achievements
  }

  useEffect(() => {
    async function load() {
      const userId = getSessionUserId()
      if (!userId) {
        setLoading(false)
        return
      }
      try {
        const ures = await api.get(`/api/users/${userId}`)
        const bres = await api.get(`/api/users/${userId}/bookings`)
        setUser(ures.data.user)
        setStats(ures.data.stats)
        setBookings(bres.data.bookings || [])
        setEditData(ures.data.user)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const createdAt = user?.createdAt ? new Date(user.createdAt) : null
  const joined = createdAt ? createdAt.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : ''
  const memberDays = createdAt ? Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return '#22c55e'
      case 'upcoming': return '#3b82f6'
      case 'cancelled': return '#ef4444'
      case 'pending': return '#f59e0b'
      default: return '#888'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return '✓'
      case 'upcoming': return '→'
      case 'cancelled': return '✕'
      case 'pending': return '⏳'
      default: return '•'
    }
  }

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '16px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h2 style={{
        marginBottom: '20px',
        fontSize: 'clamp(20px, 5vw, 32px)',
        margin: '0 0 20px 0'
      }}>👤 My Profile</h2>

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#888' }}>Loading profile...</div>
        </div>
      )}

      {!loading && !user && (
        <div className="card">
          <div className="card-title">You are not logged in</div>
          <div className="card-sub">Please login or signup to view your profile and bookings.</div>
          <div style={{ marginTop: 8 }}>
            <button className="btn" onClick={() => nav('/login')}>Go to Login / Signup</button>
          </div>
        </div>
      )}

      {!loading && user && (
        <>
          {/* Profile Header */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            marginBottom: '20px',
            padding: 'clamp(16px, 4vw, 24px)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr',
              gap: 'clamp(12px, 3vw, 16px)',
              alignItems: 'center'
            }}>
              <div style={{
                width: 'clamp(60px, 15vw, 100px)',
                height: 'clamp(60px, 15vw, 100px)',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(30px, 8vw, 50px)',
                border: '2px solid rgba(255,255,255,0.3)',
                flexShrink: 0
              }}>
                {user.avatar ? <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : '👤'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 'clamp(18px, 5vw, 24px)',
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  wordBreak: 'break-word'
                }}>
                  {user.name || 'User'}
                </div>
                <div style={{
                  fontSize: 'clamp(12px, 3vw, 14px)',
                  opacity: 0.9,
                  marginBottom: '8px',
                  wordBreak: 'break-all'
                }}>
                  {user.email}
                </div>
                <div style={{
                  fontSize: 'clamp(11px, 2.5vw, 12px)',
                  opacity: 0.8
                }}>
                  Member for {memberDays} days • Joined {joined}
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: 'clamp(6px, 2vw, 8px)',
            marginBottom: '20px',
            borderBottom: `1px solid ${theme.border}`,
            paddingBottom: '12px',
            flexWrap: 'wrap',
            overflowX: 'auto'
          }}>
            {(['overview', 'bookings', 'analytics', 'settings'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: 'clamp(6px, 2vw, 8px) clamp(12px, 3vw, 16px)',
                  borderRadius: RADIUS.md,
                  border: 'none',
                  background: activeTab === tab ? `${COLORS.primary}20` : 'transparent',
                  color: activeTab === tab ? COLORS.primary : theme.text.tertiary,
                  cursor: 'pointer',
                  fontWeight: activeTab === tab ? 600 : 400,
                  transition: TRANSITIONS.base,
                  fontSize: 'clamp(12px, 2.5vw, 14px)',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab === 'overview' && '📊 Overview'}
                {tab === 'bookings' && '📅 Bookings'}
                {tab === 'analytics' && '📈 Analytics'}
                {tab === 'settings' && '⚙️ Settings'}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div>
              {/* Stats Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(120px, 40vw, 150px), 1fr))',
                gap: 'clamp(8px, 2vw, 12px)',
                marginBottom: '20px'
              }}>
                <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff', boxShadow: SHADOWS.lg }}>
                  <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Bookings</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.total_bookings}</div>
                </div>
                <div className="card" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff', boxShadow: SHADOWS.lg }}>
                  <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Completed</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.completed}</div>
                </div>
                <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff', boxShadow: SHADOWS.lg }}>
                  <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Upcoming</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.upcoming}</div>
                </div>
                <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff', boxShadow: SHADOWS.lg }}>
                  <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Spend</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>₹{stats.total_spend.toLocaleString('en-IN')}</div>
                </div>
              </div>

              {/* Achievements Section */}
              {getAchievements().length > 0 && (
                <div style={{
                  background: theme.bg.secondary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: RADIUS.xl,
                  padding: SPACING.lg,
                  marginBottom: '20px',
                  boxShadow: SHADOWS.md
                }}>
                  <h3 style={{ margin: `0 0 ${SPACING.md} 0`, color: theme.text.primary, fontSize: '16px', fontWeight: 'bold' }}>🏆 Your Achievements</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                    gap: SPACING.md
                  }}>
                    {getAchievements().map((ach, i) => (
                      <div key={i} style={{
                        background: `${COLORS.primary}10`,
                        border: `1px solid ${COLORS.primary}30`,
                        borderRadius: RADIUS.lg,
                        padding: SPACING.md,
                        textAlign: 'center',
                        transition: TRANSITIONS.base,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)'
                        e.currentTarget.style.boxShadow = SHADOWS.lg
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}>
                        <div style={{ fontSize: '32px', marginBottom: SPACING.sm }}>{ach.icon}</div>
                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: theme.text.primary, marginBottom: '4px' }}>{ach.label}</div>
                        <div style={{ fontSize: '11px', color: theme.text.tertiary }}>{ach.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="card" style={{ background: theme.bg.secondary, border: `1px solid ${theme.border}` }}>
                <div className="card-title">📋 Contact Information</div>
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ color: theme.text.tertiary }}>Email:</div>
                    <div>{user.email}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px' }}>
                    <div style={{ color: theme.text.tertiary }}>Phone:</div>
                    <div>{user.phone || 'Not provided'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div>
              {!getAnalytics() ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px', background: theme.bg.secondary }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px', color: theme.text.primary }}>No data yet</div>
                  <div style={{ color: theme.text.tertiary, marginBottom: '16px' }}>Book a service to see analytics</div>
                </div>
              ) : (
                <>
                  {/* Key Metrics */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: SPACING.md,
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      background: `${COLORS.primary}10`,
                      border: `1px solid ${COLORS.primary}30`,
                      borderRadius: RADIUS.lg,
                      padding: SPACING.lg,
                      boxShadow: SHADOWS.md
                    }}>
                      <div style={{ fontSize: '12px', color: theme.text.tertiary, marginBottom: '8px' }}>Completion Rate</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.primary }}>{getAnalytics()?.completionRate}%</div>
                    </div>
                    <div style={{
                      background: `${COLORS.success}10`,
                      border: `1px solid ${COLORS.success}30`,
                      borderRadius: RADIUS.lg,
                      padding: SPACING.lg,
                      boxShadow: SHADOWS.md
                    }}>
                      <div style={{ fontSize: '12px', color: theme.text.tertiary, marginBottom: '8px' }}>Avg Rating</div>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: COLORS.success }}>⭐ {getAnalytics()?.avgRating}</div>
                    </div>
                    <div style={{
                      background: `${COLORS.warning}10`,
                      border: `1px solid ${COLORS.warning}30`,
                      borderRadius: RADIUS.lg,
                      padding: SPACING.lg,
                      boxShadow: SHADOWS.md
                    }}>
                      <div style={{ fontSize: '12px', color: theme.text.tertiary, marginBottom: '8px' }}>Avg Booking Value</div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.warning }}>₹{getAnalytics()?.avgBookingValue}</div>
                    </div>
                  </div>

                  {/* Service Categories Breakdown */}
                  <div style={{
                    background: theme.bg.secondary,
                    border: `1px solid ${theme.border}`,
                    borderRadius: RADIUS.xl,
                    padding: SPACING.lg,
                    marginBottom: '20px',
                    boxShadow: SHADOWS.md
                  }}>
                    <h3 style={{ margin: `0 0 ${SPACING.md} 0`, color: theme.text.primary, fontSize: '16px', fontWeight: 'bold' }}>📂 Services Breakdown</h3>
                    <div style={{ display: 'grid', gap: SPACING.md }}>
                      {Object.entries(getAnalytics()?.categories || {}).map(([cat, count]) => {
                        const total = stats?.total_bookings || 1
                        const percentage = ((count as number / total) * 100).toFixed(0)
                        return (
                          <div key={cat}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                              <span style={{ color: theme.text.primary, fontWeight: 'bold' }}>{cat}</span>
                              <span style={{ color: theme.text.tertiary }}>{count} bookings ({percentage}%)</span>
                            </div>
                            <div style={{
                              background: theme.bg.primary,
                              borderRadius: RADIUS.md,
                              height: '8px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.primaryDark})`,
                                height: '100%',
                                width: `${percentage}%`,
                                transition: `width 0.5s ease`
                              }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Monthly Spending Trend */}
                  <div style={{
                    background: theme.bg.secondary,
                    border: `1px solid ${theme.border}`,
                    borderRadius: RADIUS.xl,
                    padding: SPACING.lg,
                    boxShadow: SHADOWS.md
                  }}>
                    <h3 style={{ margin: `0 0 ${SPACING.md} 0`, color: theme.text.primary, fontSize: '16px', fontWeight: 'bold' }}>💰 Monthly Spending</h3>
                    <div style={{ display: 'grid', gap: SPACING.md }}>
                      {Object.entries(getAnalytics()?.monthlySpend || {}).map(([month, amount]) => {
                        const maxSpend = Math.max(...Object.values(getAnalytics()?.monthlySpend || {})) as number
                        const percentage = ((amount as number / maxSpend) * 100).toFixed(0)
                        return (
                          <div key={month}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                              <span style={{ color: theme.text.primary, fontWeight: 'bold' }}>{month}</span>
                              <span style={{ color: theme.text.tertiary }}>₹{(amount as number).toLocaleString('en-IN')}</span>
                            </div>
                            <div style={{
                              background: theme.bg.primary,
                              borderRadius: RADIUS.md,
                              height: '8px',
                              overflow: 'hidden'
                            }}>
                              <div style={{
                                background: `linear-gradient(90deg, ${COLORS.success}, ${COLORS.warning})`,
                                height: '100%',
                                width: `${percentage}%`,
                                transition: `width 0.5s ease`
                              }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div>
              {bookings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>No bookings yet</div>
                  <div style={{ color: '#888', marginBottom: '16px' }}>Start by booking a service</div>
                  <button className="btn" onClick={() => nav('/search')}>Browse Services</button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(250px, 80vw, 300px), 1fr))',
                  gap: 'clamp(8px, 2vw, 12px)'
                }}>
                  {bookings.map(b => {
                    const dt = b.createdAt ? new Date(b.createdAt) : null
                    const when = dt ? dt.toLocaleDateString('en-IN')  : ''
                    return (
                      <div
                        key={b.id}
                        className="card"
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          borderLeft: `4px solid ${getStatusColor(b.status)}`
                        }}
                        onClick={() => nav(`/booking/${b.id}`)}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div style={{ fontWeight: 'bold' }}>{b.service_title || 'Service'}</div>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '3px',
                            fontSize: '11px',
                            background: `${getStatusColor(b.status)}20`,
                            color: getStatusColor(b.status),
                            textTransform: 'capitalize'
                          }}>
                            {getStatusIcon(b.status)} {b.status}
                          </span>
                        </div>
                        <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>
                          Provider: {b.provider_name || 'Unknown'}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>₹{b.service_price?.toLocaleString('en-IN')}</div>
                          <div style={{ fontSize: '12px', color: '#888' }}>{when}</div>
                        </div>
                        {b.rating && (
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #333' }}>
                            <div style={{ color: '#fbbf24' }}>⭐ {b.rating.toFixed(1)}</div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <div className="card" style={{ background: theme.bg.secondary, border: `1px solid ${theme.border}`, boxShadow: SHADOWS.md }}>
                <div className="card-title" style={{ color: theme.text.primary }}>⚙️ Account Settings</div>
                {!editMode ? (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ color: theme.text.tertiary, fontWeight: 'bold' }}>Name:</div>
                      <div style={{ color: theme.text.primary }}>{user.name}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ color: theme.text.tertiary, fontWeight: 'bold' }}>Email:</div>
                      <div style={{ color: theme.text.primary }}>{user.email}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ color: theme.text.tertiary, fontWeight: 'bold' }}>Phone:</div>
                      <div style={{ color: theme.text.primary }}>{user.phone || 'Not set'}</div>
                    </div>
                    <button
                      className="btn"
                      onClick={() => {
                        setEditMode(true)
                        setEditData(user)
                      }}
                      style={{ marginTop: '12px', background: COLORS.primary, color: '#fff', border: 'none', padding: SPACING.md, borderRadius: RADIUS.md, cursor: 'pointer', fontWeight: 'bold', transition: TRANSITIONS.base }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.primaryDark)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.primary)}
                    >
                      ✏️ Edit Profile
                    </button>
                  </div>
                ) : (
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: theme.text.tertiary, fontWeight: 'bold' }}>Name</label>
                      <input
                        className="input"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        style={{ background: theme.bg.primary, color: theme.text.primary, border: `1px solid ${theme.border}`, padding: SPACING.md, borderRadius: RADIUS.md, width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: theme.text.tertiary, fontWeight: 'bold' }}>Phone</label>
                      <input
                        className="input"
                        value={editData.phone || ''}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        style={{ background: theme.bg.primary, color: theme.text.primary, border: `1px solid ${theme.border}`, padding: SPACING.md, borderRadius: RADIUS.md, width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn" onClick={() => setEditMode(false)} style={{ background: COLORS.primary, color: '#fff', border: 'none', padding: SPACING.md, borderRadius: RADIUS.md, cursor: 'pointer', fontWeight: 'bold', flex: 1, transition: TRANSITIONS.base }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.primaryDark)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.primary)}>
                        ✓ Save Changes
                      </button>
                      <button className="btn" onClick={() => { setEditMode(false); setEditData(user) }} style={{ background: theme.bg.tertiary, color: theme.text.primary, border: `1px solid ${theme.border}`, padding: SPACING.md, borderRadius: RADIUS.md, cursor: 'pointer', fontWeight: 'bold', flex: 1, transition: TRANSITIONS.base }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = theme.bg.secondary)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = theme.bg.tertiary)}>
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Preferences */}
              <div className="card" style={{ marginTop: '12px', background: theme.bg.secondary, border: `1px solid ${theme.border}`, boxShadow: SHADOWS.md }}>
                <div className="card-title" style={{ color: theme.text.primary }}>🔔 Notification Preferences</div>
                <div style={{ marginTop: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer', color: theme.text.primary }}>
                    <input type="checkbox" defaultChecked style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                    <span>📧 Email notifications for bookings</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer', color: theme.text.primary }}>
                    <input type="checkbox" defaultChecked style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                    <span>📱 SMS notifications for updates</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: theme.text.primary }}>
                    <input type="checkbox" defaultChecked style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                    <span>🎯 Marketing emails and offers</span>
                  </label>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="card" style={{ marginTop: '12px', background: `${COLORS.danger}10`, border: `1px solid ${COLORS.danger}30`, boxShadow: SHADOWS.md }}>
                <div className="card-title" style={{ color: COLORS.danger }}>⚠️ Danger Zone</div>
                <div style={{ marginTop: '12px' }}>
                  <p style={{ color: theme.text.tertiary, fontSize: '13px', marginBottom: '12px' }}>These actions cannot be undone.</p>
                  <button style={{
                    background: COLORS.danger,
                    color: '#fff',
                    border: 'none',
                    padding: SPACING.md,
                    borderRadius: RADIUS.md,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: TRANSITIONS.base,
                    width: '100%'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}>
                    🗑️ Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
