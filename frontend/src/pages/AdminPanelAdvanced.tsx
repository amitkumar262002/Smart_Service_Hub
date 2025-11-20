import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessionUser } from '@/auth'
import { api } from '@/api/client'

export default function AdminPanelAdvanced() {
  const nav = useNavigate()
  const user = getSessionUser()
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'providers' | 'bookings' | 'reports' | 'settings'>('dashboard')
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Owner email (must match backend & Firebase)
  const OWNER_EMAIL = 'supermanverma@gmail.com'
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()

  useEffect(() => {
    // Check if user is owner
    if (!isOwner) {
      setError('❌ Access Denied: Only owner can access this panel')
      setTimeout(() => nav('/'), 2000)
      return
    }

    loadDashboardData()
  }, [isOwner])

  async function loadDashboardData() {
    try {
      setLoading(true)
      setError('')

      // Get stats
      const statsRes = await api.get('/api/admin/stats', {
        headers: { 'X-User-Email': user?.email }
      })
      setStats(statsRes.data.stats)

      // Get users
      const usersRes = await api.get('/api/admin/users', {
        headers: { 'X-User-Email': user?.email }
      })
      setUsers(usersRes.data.users)

      // Get providers
      const providersRes = await api.get('/api/admin/providers', {
        headers: { 'X-User-Email': user?.email }
      })
      setProviders(providersRes.data.providers)

      // Get bookings
      const bookingsRes = await api.get('/api/admin/bookings', {
        headers: { 'X-User-Email': user?.email }
      })
      setBookings(bookingsRes.data.bookings)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    try {
      const res = await api.put(`/api/admin/users/${userId}/role`, 
        { role: newRole },
        { headers: { 'X-User-Email': user?.email } }
      )
      setSuccess('✅ User role updated successfully')
      loadDashboardData()
    } catch (e: any) {
      setError('❌ Failed to update user role')
    }
  }

  async function updateUserStatus(userId: string, newStatus: string) {
    try {
      const res = await api.put(`/api/admin/users/${userId}/status`, 
        { status: newStatus },
        { headers: { 'X-User-Email': user?.email } }
      )
      setSuccess('✅ User status updated successfully')
      loadDashboardData()
    } catch (e: any) {
      setError('❌ Failed to update user status')
    }
  }

  async function verifyProvider(providerId: string) {
    try {
      await api.put(`/api/admin/providers/${providerId}/verify`, 
        {},
        { headers: { 'X-User-Email': user?.email } }
      )
      setSuccess('✅ Provider verified successfully')
      loadDashboardData()
    } catch (e: any) {
      setError('❌ Failed to verify provider')
    }
  }

  async function suspendProvider(providerId: string) {
    try {
      await api.put(`/api/admin/providers/${providerId}/suspend`, 
        {},
        { headers: { 'X-User-Email': user?.email } }
      )
      setSuccess('✅ Provider suspended successfully')
      loadDashboardData()
    } catch (e: any) {
      setError('❌ Failed to suspend provider')
    }
  }

  async function cancelBooking(bookingId: string) {
    try {
      await api.put(`/api/admin/bookings/${bookingId}/cancel`, 
        {},
        { headers: { 'X-User-Email': user?.email } }
      )
      setSuccess('✅ Booking cancelled successfully')
      loadDashboardData()
    } catch (e: any) {
      setError('❌ Failed to cancel booking')
    }
  }

  async function exportReport() {
    try {
      const res = await api.get('/api/admin/reports/export', {
        headers: { 'X-User-Email': user?.email }
      })
      const dataStr = JSON.stringify(res.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`
      link.click()
      setSuccess('✅ Report exported successfully')
    } catch (e: any) {
      setError('❌ Failed to export report')
    }
  }

  if (!isOwner) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ color: '#dc2626', fontSize: '16px', fontWeight: 'bold' }}>
          ❌ Access Denied
        </div>
        <div style={{ color: '#888', marginTop: '8px' }}>
          Only the owner can access this panel
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#888' }}>⏳ Loading admin dashboard...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>🔐 Admin Panel</h1>
        <p style={{ margin: 0, color: '#888', fontSize: '12px' }}>
          Owner Only Access • {user?.email}
        </p>
      </div>

      {/* Messages */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '12px',
          fontSize: '12px'
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          background: '#dcfce7',
          border: '1px solid #bbf7d0',
          color: '#16a34a',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '12px',
          fontSize: '12px'
        }}>
          {success}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid #333',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {(['dashboard', 'users', 'providers', 'bookings', 'reports', 'settings'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none',
              background: activeTab === tab ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
              color: activeTab === tab ? '#667eea' : '#888',
              cursor: 'pointer',
              fontWeight: activeTab === tab ? 600 : 400,
              transition: 'all 0.2s ease'
            }}
          >
            {tab === 'dashboard' && '📊 Dashboard'}
            {tab === 'users' && '👥 Users'}
            {tab === 'providers' && '🔧 Providers'}
            {tab === 'bookings' && '📅 Bookings'}
            {tab === 'reports' && '📈 Reports'}
            {tab === 'settings' && '⚙️ Settings'}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <div>
          {/* Key Metrics */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Users</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.users.total}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Active: {stats.users.active}</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: '#fff',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Providers</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.providers.total}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Active: {stats.providers.active}</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: '#fff',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Bookings</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.bookings.total}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Completed: {stats.bookings.completed}</div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: '#fff',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Revenue</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>₹{stats.revenue.total.toLocaleString()}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Avg: ₹{Math.round(stats.revenue.average_transaction)}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #333',
            padding: '16px',
            borderRadius: '8px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>⚡ Quick Actions</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
              <button
                onClick={exportReport}
                style={{
                  padding: '10px',
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                📥 Export Report
              </button>
              <button
                onClick={() => setActiveTab('users')}
                style={{
                  padding: '10px',
                  background: '#764ba2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                👥 Manage Users
              </button>
              <button
                onClick={() => setActiveTab('providers')}
                style={{
                  padding: '10px',
                  background: '#f093fb',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                🔧 Manage Providers
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                style={{
                  padding: '10px',
                  background: '#4facfe',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                📅 Manage Bookings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid #333',
          padding: '16px',
          borderRadius: '8px',
          overflowX: 'auto'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>👥 User Management ({users.length})</div>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Email</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Role</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '8px' }}>{u.name}</td>
                  <td style={{ padding: '8px', color: '#888' }}>{u.email}</td>
                  <td style={{ padding: '8px' }}>
                    <select
                      value={u.role}
                      onChange={(e) => updateUserRole(u.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #333',
                        background: '#1a1a1a',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      <option>user</option>
                      <option>provider</option>
                      <option>admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <select
                      value={u.status || 'active'}
                      onChange={(e) => updateUserStatus(u.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #333',
                        background: '#1a1a1a',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      <option>active</option>
                      <option>suspended</option>
                      <option>banned</option>
                    </select>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <button
                      onClick={() => updateUserStatus(u.id, 'suspended')}
                      style={{
                        padding: '4px 8px',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid #333',
          padding: '16px',
          borderRadius: '8px',
          overflowX: 'auto'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>🔧 Provider Management ({providers.length})</div>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Category</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Rating</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((p: any) => (
                <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '8px' }}>{p.name}</td>
                  <td style={{ padding: '8px', color: '#888', fontSize: '11px' }}>{p.category || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>⭐ {(p.rating || 0).toFixed(1)}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      background: p.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                      color: p.status === 'active' ? '#22c55e' : '#9ca3af'
                    }}>
                      {p.status || 'active'}
                    </span>
                  </td>
                  <td style={{ padding: '8px', display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => verifyProvider(p.id)}
                      style={{
                        padding: '4px 8px',
                        background: '#22c55e',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => suspendProvider(p.id)}
                      style={{
                        padding: '4px 8px',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Suspend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid #333',
          padding: '16px',
          borderRadius: '8px',
          overflowX: 'auto'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>📅 Booking Management ({bookings.length})</div>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px'
          }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>ID</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>User</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Provider</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 10).map((b: any) => (
                <tr key={b.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '8px', fontSize: '11px', color: '#888' }}>{b.id?.slice(0, 8)}</td>
                  <td style={{ padding: '8px' }}>{b.user_name || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>{b.provider_name || 'N/A'}</td>
                  <td style={{ padding: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '3px',
                      fontSize: '11px',
                      background: b.status === 'completed' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                      color: b.status === 'completed' ? '#22c55e' : '#3b82f6'
                    }}>
                      {b.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <button
                      onClick={() => cancelBooking(b.id)}
                      style={{
                        padding: '4px 8px',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div>
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid #333',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>📈 Reports & Analytics</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              <button
                onClick={exportReport}
                style={{
                  padding: '12px',
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📥 Export Full Report
              </button>
              <button
                onClick={loadDashboardData}
                style={{
                  padding: '12px',
                  background: '#764ba2',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid #333',
          padding: '16px',
          borderRadius: '8px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px' }}>⚙️ System Settings</div>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Owner Email</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{OWNER_EMAIL}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Current User</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{user?.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Access Level</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#22c55e' }}>🔐 Owner (Full Access)</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>Last Updated</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold' }}>{new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
