import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ProvidersAPI, ServicesAPI, ReviewsAPI } from '@/api/client'
import ServiceCard from '@/components/ServiceCard'

export default function ProviderProfileAdvanced() {
  const { id } = useParams()
  const nav = useNavigate()
  const [provider, setProvider] = useState<any | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewStats, setReviewStats] = useState<{ count: number; avg_rating: number } | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reviews'>('overview')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    (async () => {
      try {
        setLoading(true)
        const provs = await ProvidersAPI.list()
        const p = provs.find((x: any) => x.id === id) || null
        setProvider(p)
      } catch {
        setProvider(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  useEffect(() => {
    if (!id) return
    ;(async () => {
      try {
        const res = await ReviewsAPI.listForProvider(id)
        setReviews(res.reviews || [])
        setReviewStats(res.stats || null)
      } catch {
        setReviews([])
        setReviewStats(null)
      }
    })()
  }, [id])

  useEffect(() => {
    if (!id) return
    ;(async () => {
      const all = await ServicesAPI.list()
      setServices(all.filter((s: any) => s.provider_id === id))
    })()
  }, [id])

  const stats = useMemo(() => {
    if (!services.length) return null
    const total = services.length
    const sum = services.reduce((acc, s) => acc + (s.price || 0), 0)
    const avg = total ? Math.round(sum / total) : 0
    const categories = Array.from(new Set(services.map((s: any) => s.category).filter(Boolean))) as string[]
    const minPrice = Math.min(...services.map(s => s.price || 0))
    const maxPrice = Math.max(...services.map(s => s.price || 0))
    return { total, avg, categories, minPrice, maxPrice }
  }, [services])

  const ratingDist = useMemo(() => {
    const base = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    if (!reviews || !reviews.length) return base
    const copy = { ...base }
    for (const r of reviews) {
      const v = Math.round(Number(r.rating) || 0) as 1 | 2 | 3 | 4 | 5
      if (copy[v] !== undefined) copy[v] += 1
    }
    return copy
  }, [reviews])

  const serviceRatings = useMemo(() => {
    const ratings: { [key: string]: { total: number; count: number; avg: number } } = {}
    reviews.forEach(r => {
      const serviceId = r.service_id || 'general'
      if (!ratings[serviceId]) {
        ratings[serviceId] = { total: 0, count: 0, avg: 0 }
      }
      ratings[serviceId].total += r.rating || 0
      ratings[serviceId].count += 1
      ratings[serviceId].avg = ratings[serviceId].total / ratings[serviceId].count
    })
    return ratings
  }, [reviews])

  const name = provider?.name || (id ? `Provider ${id}` : 'Provider')
  const backendRating = provider?.rating || 0
  const rating = reviewStats?.avg_rating || backendRating || 0
  const address = provider?.address || 'Address not set'
  const plan = provider?.plan || 'basic'

  if (loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#888' }}>Loading provider profile...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Provider Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          gap: '20px',
          alignItems: 'center'
        }}>
          {/* Avatar */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '50px',
            border: '3px solid rgba(255,255,255,0.3)'
          }}>
            🔧
          </div>

          {/* Info */}
          <div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '28px' }}>{name}</h2>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>{address}</div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Rating</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>⭐ {rating.toFixed(1)}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Reviews</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{reviewStats?.count || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', opacity: 0.8 }}>Services</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats?.total || 0}</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button className="btn" onClick={() => nav('/search')} style={{ background: '#fff', color: '#667eea', fontWeight: 'bold' }}>
              📞 Book Service
            </button>
            <button className="btn" style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)' }}>
              💬 Message
            </button>
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
        {(['overview', 'services', 'reviews'] as const).map(tab => (
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
            {tab === 'overview' && '📊 Overview'}
            {tab === 'services' && '🛠️ Services'}
            {tab === 'reviews' && '⭐ Reviews'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Average Rating</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{rating.toFixed(1)} ⭐</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Based on {reviewStats?.count || 0} reviews</div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Services</div>
              <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats?.total || 0}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Active services</div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Price Range</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>₹{stats?.minPrice?.toLocaleString('en-IN')} - ₹{stats?.maxPrice?.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Average: ₹{stats?.avg?.toLocaleString('en-IN')}</div>
            </div>

            <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: '#fff' }}>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>Plan</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'capitalize' }}>{plan}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>Current subscription</div>
            </div>
          </div>

          {/* Categories */}
          {stats && stats.categories.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-title">🏷️ Service Categories</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                {stats.categories.map(c => (
                  <span key={c} className="chip" style={{
                    padding: '6px 12px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#3b82f6',
                    borderRadius: '20px',
                    fontSize: '13px'
                  }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rating Distribution */}
          {reviewStats && reviewStats.count > 0 && (
            <div className="card">
              <div className="card-title">📊 Rating Distribution</div>
              <div style={{ marginTop: '12px' }}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = ratingDist[star as 1 | 2 | 3 | 4 | 5] || 0
                  const pct = reviewStats.count ? Math.round((count / reviewStats.count) * 100) : 0
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ width: '60px', fontSize: '14px', fontWeight: 'bold' }}>{star} ⭐</div>
                      <div style={{ flex: 1, height: '8px', borderRadius: '999px', background: '#333', overflow: 'hidden' }}>
                        <div style={{
                          width: `${pct}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #22c55e, #fbbf24)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                      <div style={{ width: '50px', textAlign: 'right', fontSize: '13px', color: '#888' }}>
                        {pct}% ({count})
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div>
          {services.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔧</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>No services yet</div>
              <div style={{ color: '#888' }}>This provider hasn't listed any services</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '12px'
            }}>
              {services.map(s => {
                const serviceRating = serviceRatings[s.id]
                return (
                  <div key={s.id} className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{s.title || s.name}</div>
                      {serviceRating && (
                        <div style={{ color: '#fbbf24', fontSize: '14px', fontWeight: 'bold' }}>
                          ⭐ {serviceRating.avg.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>
                      {s.category || 'General'}
                    </div>
                    {s.description && (
                      <div style={{ fontSize: '13px', marginBottom: '8px', color: '#aaa' }}>
                        {s.description.substring(0, 100)}...
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #333' }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#22c55e' }}>₹{s.price?.toLocaleString('en-IN')}</div>
                      <button className="btn" style={{ padding: '4px 12px', fontSize: '12px' }}>Book Now</button>
                    </div>
                    {serviceRating && (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#888' }}>
                        {serviceRating.count} customer{serviceRating.count !== 1 ? 's' : ''} rated this
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div>
          {reviews.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>💬</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>No reviews yet</div>
              <div style={{ color: '#888' }}>Be the first to review this provider</div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '12px'
            }}>
              {reviews.map(r => (
                <div key={r.id} className="card" style={{ borderLeft: '4px solid #fbbf24' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{r.customer_name || 'Anonymous'}</div>
                      <div style={{ color: '#fbbf24', fontSize: '16px', fontWeight: 'bold' }}>
                        {'⭐'.repeat(Math.round(r.rating || 0))}
                      </div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'Recently'}
                    </div>
                  </div>

                  {r.service_title && (
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px', padding: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                      Service: {r.service_title}
                    </div>
                  )}

                  {r.comment && (
                    <div style={{ fontSize: '13px', marginBottom: '8px', lineHeight: '1.5' }}>
                      "{r.comment}"
                    </div>
                  )}

                  {r.photos && r.photos.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                      {r.photos.map((p: string, idx: number) => (
                        <img
                          key={idx}
                          src={p}
                          alt="review"
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            border: '1px solid #333',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {r.verified_purchase && (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ✓ Verified Purchase
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Back Button */}
      <div style={{ marginTop: '20px' }}>
        <Link to="/search" className="btn" style={{ display: 'inline-block' }}>← Back to Search</Link>
      </div>
    </div>
  )
}
