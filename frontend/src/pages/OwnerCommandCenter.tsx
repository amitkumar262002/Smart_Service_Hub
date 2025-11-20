import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessionUser } from '@/auth'
import { api } from '@/api/client'

const OWNER_EMAIL = 'supermanverma@gmail.com'

export default function OwnerCommandCenter() {
  const nav = useNavigate()
  const user = getSessionUser()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dashboard data
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])

  // Check owner access
  useEffect(() => {
    if (!user || user.email?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
      nav('/')
      return
    }
  }, [user, nav])

  // Load dashboard data
  useEffect(() => {
    if (activeTab === 'dashboard') loadDashboard()
    else if (activeTab === 'users') loadUsers()
    else if (activeTab === 'providers') loadProviders()
    else if (activeTab === 'bookings') loadBookings()
  }, [activeTab])

  async function loadDashboard() {
    try {
      setLoading(true)
      const res = await api.get('/api/secure/admin/dashboard', {
        headers: {
          'X-User-Email': user?.email || '',
          'X-User-ID': user?.id || '',
          'X-User-Role': 'admin'
        }
      })
      setStats(res.data.dashboard)
    } catch (e: any) {
      setError('Failed to load dashboard')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    try {
      setLoading(true)
      const res = await api.get('/api/secure/admin/all-users', {
        headers: {
          'X-User-Email': user?.email || '',
          'X-User-ID': user?.id || '',
          'X-User-Role': 'admin'
        }
      })
      setUsers(res.data.users || [])
    } catch (e: any) {
      setError('Failed to load users')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadProviders() {
    try {
      setLoading(true)
      const res = await api.get('/api/secure/admin/all-providers', {
        headers: {
          'X-User-Email': user?.email || '',
          'X-User-ID': user?.id || '',
          'X-User-Role': 'admin'
        }
      })
      setProviders(res.data.providers || [])
    } catch (e: any) {
      setError('Failed to load providers')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadBookings() {
    try {
      setLoading(true)
      const res = await api.get('/api/secure/admin/all-bookings', {
        headers: {
          'X-User-Email': user?.email || '',
          'X-User-ID': user?.id || '',
          'X-User-Role': 'admin'
        }
      })
      setBookings(res.data.bookings || [])
    } catch (e: any) {
      setError('Failed to load bookings')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function updateUserRole(userId: string, newRole: string) {
    try {
      setLoading(true)
      await api.put(`/api/admin/users/${userId}/role`, 
        { role: newRole },
        {
          headers: {
            'X-User-Email': user?.email || '',
            'X-User-ID': user?.id || '',
            'X-User-Role': 'admin'
          }
        }
      )
      setSuccess('User role updated!')
      loadUsers()
    } catch (e: any) {
      setError('Failed to update user role')
    } finally {
      setLoading(false)
    }
  }

  async function suspendUser(userId: string) {
    try {
      setLoading(true)
      await api.put(`/api/admin/users/${userId}/status`,
        { status: 'suspended' },
        {
          headers: {
            'X-User-Email': user?.email || '',
            'X-User-ID': user?.id || '',
            'X-User-Role': 'admin'
          }
        }
      )
      setSuccess('User suspended!')
      loadUsers()
    } catch (e: any) {
      setError('Failed to suspend user')
    } finally {
      setLoading(false)
    }
  }

  async function verifyProvider(providerId: string) {
    try {
      setLoading(true)
      await api.put(`/api/admin/providers/${providerId}/verify`,
        {},
        {
          headers: {
            'X-User-Email': user?.email || '',
            'X-User-ID': user?.id || '',
            'X-User-Role': 'admin'
          }
        }
      )
      setSuccess('Provider verified!')
      loadProviders()
    } catch (e: any) {
      setError('Failed to verify provider')
    } finally {
      setLoading(false)
    }
  }

  async function suspendProvider(providerId: string) {
    try {
      setLoading(true)
      await api.put(`/api/admin/providers/${providerId}/suspend`,
        {},
        {
          headers: {
            'X-User-Email': user?.email || '',
            'X-User-ID': user?.id || '',
            'X-User-Role': 'admin'
          }
        }
      )
      setSuccess('Provider suspended!')
      loadProviders()
    } catch (e: any) {
      setError('Failed to suspend provider')
    } finally {
      setLoading(false)
    }
  }

  async function cancelBooking(bookingId: string) {
    try {
      setLoading(true)
      await api.put(`/api/admin/bookings/${bookingId}/cancel`,
        {},
        {
          headers: {
            'X-User-Email': user?.email || '',
            'X-User-ID': user?.id || '',
            'X-User-Role': 'admin'
          }
        }
      )
      setSuccess('Booking cancelled!')
      loadBookings()
    } catch (e: any) {
      setError('Failed to cancel booking')
    } finally {
      setLoading(false)
    }
  }

  async function exportReport() {
    try {
      setLoading(true)
      const res = await api.get('/api/secure/admin/all-users', {
        headers: {
          'X-User-Email': user?.email || '',
          'X-User-ID': user?.id || '',
          'X-User-Role': 'admin'
        }
      })
      const dataStr = JSON.stringify(res.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `admin-report-${new Date().toISOString()}.json`
      link.click()
      setSuccess('Report exported!')
    } catch (e: any) {
      setError('Failed to export report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '20px',
      color: '#fff'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'rgba(0,0,0,0.2)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '32px' }}>
            👑 Owner Command Center
          </h1>
          <p style={{ margin: '0', opacity: 0.9 }}>
            Welcome {user?.name} | Manage your entire system
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#dc2626',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            ❌ {error}
          </div>
        )}
        {success && (
          <div style={{
            background: '#dcfce7',
            color: '#16a34a',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          {[
            { id: 'dashboard', label: '📊 Dashboard' },
            { id: 'users', label: '👥 Users' },
            { id: 'providers', label: '🔧 Providers' },
            { id: 'bookings', label: '📅 Bookings' },
            { id: 'reports', label: '📈 Reports' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 16px',
                background: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.2)',
                color: activeTab === tab.id ? '#667eea' : '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: '0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          color: '#000',
          padding: '20px',
          borderRadius: '12px',
          minHeight: '400px'
        }}>
          {loading && <div style={{ textAlign: 'center', padding: '40px' }}>⏳ Loading...</div>}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && stats && !loading && (
            <div>
              <h2 style={{ margin: '0 0 20px 0' }}>📊 System Dashboard</h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Total Users</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0284c7' }}>
                    {stats.users?.total || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    Active: {stats.users?.active || 0}
                  </div>
                </div>

                <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Total Providers</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d97706' }}>
                    {stats.providers?.total || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    Verified: {stats.providers?.verified || 0}
                  </div>
                </div>

                <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Total Bookings</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>
                    {stats.bookings?.total || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    Completed: {stats.bookings?.completed || 0}
                  </div>
                </div>

                <div style={{ background: '#fce7f3', padding: '16px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>Total Revenue</div>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#db2777' }}>
                    ₹{stats.revenue?.total || 0}
                  </div>
                  <div style={{ fontSize: '11px', color: '#999' }}>
                    Avg: ₹{Math.round(stats.revenue?.average || 0)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && !loading && (
            <div>
              <h2 style={{ margin: '0 0 20px 0' }}>👥 User Management ({users.length})</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>{u.name}</td>
                        <td style={{ padding: '12px' }}>{u.email}</td>
                        <td style={{ padding: '12px' }}>
                          <select
                            value={u.role}
                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                            style={{
                              padding: '6px',
                              borderRadius: '4px',
                              border: '1px solid #d1d5db',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="user">User</option>
                            <option value="provider">Provider</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: u.status === 'active' ? '#dcfce7' : '#fee2e2',
                            color: u.status === 'active' ? '#16a34a' : '#dc2626',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {u.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button
                            onClick={() => suspendUser(u.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
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
            </div>
          )}

          {/* Providers Tab */}
          {activeTab === 'providers' && !loading && (
            <div>
              <h2 style={{ margin: '0 0 20px 0' }}>🔧 Provider Management ({providers.length})</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Category</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Rating</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Verified</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((p: any) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px' }}>{p.name}</td>
                        <td style={{ padding: '12px' }}>{p.category}</td>
                        <td style={{ padding: '12px' }}>⭐ {p.rating}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: p.verified ? '#dcfce7' : '#fef3c7',
                            color: p.verified ? '#16a34a' : '#d97706',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {p.verified ? '✓ Yes' : '✗ No'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', display: 'flex', gap: '8px' }}>
                          {!p.verified && (
                            <button
                              onClick={() => verifyProvider(p.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#dcfce7',
                                color: '#16a34a',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Verify
                            </button>
                          )}
                          <button
                            onClick={() => suspendProvider(p.id)}
                            style={{
                              padding: '6px 12px',
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
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
            </div>
          )}

          {/* Bookings Tab */}
          {activeTab === 'bookings' && !loading && (
            <div>
              <h2 style={{ margin: '0 0 20px 0' }}>📅 Booking Management ({bookings.length})</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Provider</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                      <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b: any) => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontSize: '12px' }}>{b.id?.substring(0, 8)}</td>
                        <td style={{ padding: '12px' }}>{b.user_id}</td>
                        <td style={{ padding: '12px' }}>{b.provider_id}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: b.status === 'completed' ? '#dcfce7' : '#fef3c7',
                            color: b.status === 'completed' ? '#16a34a' : '#d97706',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px'
                          }}>
                            {b.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>₹{b.amount}</td>
                        <td style={{ padding: '12px' }}>
                          {b.status !== 'cancelled' && (
                            <button
                              onClick={() => cancelBooking(b.id)}
                              style={{
                                padding: '6px 12px',
                                background: '#fee2e2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '12px'
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && !loading && (
            <div>
              <h2 style={{ margin: '0 0 20px 0' }}>📈 Reports & Export</h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                <button
                  onClick={exportReport}
                  style={{
                    padding: '16px',
                    background: '#667eea',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  📥 Export Full Report (JSON)
                </button>
                <div style={{
                  background: '#f0f9ff',
                  padding: '16px',
                  borderRadius: '8px',
                  borderLeft: '4px solid #0284c7'
                }}>
                  <h3 style={{ margin: '0 0 8px 0' }}>System Health</h3>
                  <p style={{ margin: '0', fontSize: '14px' }}>
                    ✅ All systems operational
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
