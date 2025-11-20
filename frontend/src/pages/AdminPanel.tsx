import { useEffect, useState } from 'react'
import { AdminAPI } from '@/api/client'
import { useI18n } from '@/i18n'

export default function AdminPanel() {
  const [stats, setStats] = useState<any | null>(null)
  const [metrics, setMetrics] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'providers' | 'revenue'>('overview')
  const { t } = useI18n()

  useEffect(() => {
    Promise.all([
      AdminAPI.fraudMetrics(),
      fetch('/api/admin/stats').then(r => r.json()).then(d => d.stats)
    ])
      .then(([metricsData, statsData]) => {
        setMetrics(metricsData)
        setStats(statsData)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <h2>{t('admin.title')}</h2>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#888' }}>Loading admin dashboard...</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>🔐 Admin Dashboard</h2>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        borderBottom: '1px solid #333',
        paddingBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {(['overview', 'users', 'providers', 'revenue'] as const).map(tab => (
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
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* Key Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Users</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.users.total}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Active: {stats.users.active}</div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Providers</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.providers.total}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Active: {stats.providers.active}</div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Bookings</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.bookings.total}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Completed: {stats.bookings.completed}</div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Total Revenue</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>₹{stats.revenue.total.toLocaleString()}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Avg: ₹{Math.round(stats.revenue.average_transaction)}</div>
            </div>
          </div>

          {/* Transaction Breakdown */}
          {metrics && (
            <div className="card">
              <div className="card-title">💳 Payment Methods</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '12px' }}>
                {Object.entries(metrics.by_method || {}).map(([method, count]) => (
                  <div key={method} style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>{method}</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{String(count)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && stats && (
        <div>
          <div className="card">
            <div className="card-title">👥 All Users ({stats.users.total})</div>
            <div style={{ marginTop: '12px', overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Email</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Role</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.users.list.map((user: any) => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '8px' }}>{user.name}</td>
                      <td style={{ padding: '8px', color: '#888' }}>{user.email}</td>
                      <td style={{ padding: '8px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          background: user.role === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                          color: user.role === 'admin' ? '#ef4444' : '#3b82f6'
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '8px', color: '#888', fontSize: '12px' }}>
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Providers Tab */}
      {activeTab === 'providers' && stats && (
        <div>
          <div className="card">
            <div className="card-title">🔧 All Providers ({stats.providers.total})</div>
            <div style={{ marginTop: '12px', overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #333' }}>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Name</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Categories</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Rating</th>
                    <th style={{ textAlign: 'left', padding: '8px', fontWeight: 600 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.providers.list.map((provider: any) => (
                    <tr key={provider.id} style={{ borderBottom: '1px solid #222' }}>
                      <td style={{ padding: '8px' }}>{provider.name}</td>
                      <td style={{ padding: '8px', color: '#888', fontSize: '12px' }}>
                        {provider.categories.join(', ') || 'N/A'}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span style={{ color: '#fbbf24' }}>⭐ {provider.rating.toFixed(1)}</span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          background: provider.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(107, 114, 128, 0.2)',
                          color: provider.status === 'active' ? '#22c55e' : '#9ca3af'
                        }}>
                          {provider.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && stats && metrics && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div className="card">
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Total Revenue</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#22c55e' }}>₹{stats.revenue.total.toLocaleString()}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Total Transactions</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.revenue.transactions}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Average Transaction</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>₹{Math.round(stats.revenue.average_transaction).toLocaleString()}</div>
            </div>
            <div className="card">
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>High Value (≥ 2000)</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{metrics.high_value_count}</div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">Payment Methods Breakdown</div>
            <div style={{ marginTop: '12px' }}>
              {Object.entries(metrics.by_method || {}).map(([method, count]) => (
                <div key={method} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  marginBottom: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '6px'
                }}>
                  <div>{method}</div>
                  <div style={{ fontWeight: 'bold' }}>{String(count)} transactions</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="card" style={{ marginTop: '20px' }}>
        <button className="btn" style={{
          width: '100%',
          padding: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 600
        }}>
          📥 Export Report (Coming Soon)
        </button>
      </div>
    </div>
  )
}
