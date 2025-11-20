import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { ProvidersAPI, ServicesAPI, ReviewsAPI } from '@/api/client'
import ServiceCard from '@/components/ServiceCard'

export default function ProviderProfile() {
  const { id } = useParams()
  const nav = useNavigate()
  const [provider, setProvider] = useState<any|null>(null)
  const [services, setServices] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewStats, setReviewStats] = useState<{count:number;avg_rating:number}|null>(null)
  const [showRatingPopup, setShowRatingPopup] = useState(false)

  useEffect(() => {
    if (!id) return
    (async () => {
      try {
        const provs = await ProvidersAPI.list()
        const p = provs.find((x:any) => x.id === id) || null
        setProvider(p)
      } catch {
        setProvider(null)
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
      setServices(all.filter((s:any) => s.provider_id === id))
    })()
  }, [id])

  const stats = useMemo(() => {
    if (!services.length) return null
    const total = services.length
    const sum = services.reduce((acc, s) => acc + (s.price || 0), 0)
    const avg = total ? Math.round(sum / total) : 0
    const categories = Array.from(new Set(services.map((s:any) => s.category).filter(Boolean))) as string[]
    return { total, avg, categories }
  }, [services])

  const name = provider?.name || (id ? `Provider ${id}` : 'Provider')
  const backendRating = provider?.rating || 0
  const rating = reviewStats?.avg_rating || backendRating || 0
  const address = provider?.address || 'Address not set'
  const plan = provider?.plan || 'basic'

  const ratingDist = useMemo(() => {
    const base = { 1:0, 2:0, 3:0, 4:0, 5:0 }
    if (!reviews || !reviews.length) return base
    const copy = { ...base }
    for (const r of reviews) {
      const v = Math.round(Number(r.rating) || 0) as 1|2|3|4|5
      if (copy[v] !== undefined) copy[v] += 1
    }
    return copy
  }, [reviews])

  return (
    <div>
      <h2>{name}</h2>
      <div className="card" style={{marginTop:12}}>
        <div className="card-title">Overview</div>
        <div className="card-sub">{address}</div>
        <div style={{marginTop:6}}>
          <button
            type="button"
            style={{
              border:'none',
              background:'transparent',
              padding:0,
              cursor:'pointer',
              color:'inherit',
              display:'inline-flex',
              alignItems:'center',
              gap:4,
            }}
            onClick={() => reviewStats && reviewStats.count > 0 && setShowRatingPopup(true)}
          >
            <span style={{fontWeight:600}}>Rating:</span>
            <span>{rating.toFixed ? rating.toFixed(1) : rating} ★</span>
            {reviewStats && reviewStats.count > 0 && (
              <span style={{fontSize:12, color:'#9ca3af'}}>
                ({reviewStats.count} reviews)
              </span>
            )}
          </button>
        </div>
        <div style={{marginTop:4,fontSize:13}}>Current plan: <span style={{textTransform:'capitalize'}}>{plan}</span></div>
        {stats && (
          <div style={{marginTop:8}}>
            <div className="grid">
              <div>
                <div className="card-sub">Services listed</div>
                <div>{stats.total}</div>
              </div>
              <div>
                <div className="card-sub">Avg. price</div>
                <div>₹ {stats.avg}</div>
              </div>
            </div>
            {stats.categories.length > 0 && (
              <div style={{marginTop:8}}>
                <div className="card-sub">Categories</div>
                <div className="chips" style={{marginTop:4}}>
                  {stats.categories.map(c => <span key={c} className="chip chip-sm">{c}</span>)}
                </div>
              </div>
            )}
          </div>
        )}
        <div style={{marginTop:10, display:'flex', gap:8, flexWrap:'wrap'}}>
          <button className="btn" onClick={()=>nav('/search')}>Book a service</button>
          <button className="btn" onClick={()=>nav('/provider')}>View provider dashboard</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        {services.map(s => <ServiceCard key={s.id} service={s} />)}
      </div>
      {reviews.length > 0 && (
        <div className="card" style={{marginTop:12}}>
          <div className="card-title">Recent reviews</div>
          <div className="card-sub">What customers are saying about this provider.</div>
          <div style={{marginTop:8, display:'flex', flexDirection:'column', gap:8}}>
            {reviews.slice(0, 5).map(r => (
              <div key={r.id} className="card" style={{padding:8}}>
                <div style={{fontSize:13,fontWeight:600}}>★ {r.rating}</div>
                {r.comment && (
                  <div style={{marginTop:4,fontSize:13}}>{r.comment}</div>
                )}
                {r.photos && r.photos.length > 0 && (
                  <div style={{marginTop:6,display:'flex',gap:6,flexWrap:'wrap'}}>
                    {r.photos.map((p:string, idx:number) => (
                      <img
                        key={idx}
                        src={p}
                        alt="review"
                        style={{width:72,height:72,objectFit:'cover',borderRadius:8,border:'1px solid #1f2937'}}
                      />
                    ))}
                  </div>
                )}
                <div style={{marginTop:4,fontSize:11,color:'#9ca3af'}}>{r.createdAt ? new Date(r.createdAt).toLocaleString() : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {showRatingPopup && reviewStats && (
        <div className="modal-backdrop" onClick={() => setShowRatingPopup(false)}>
          <div
            className="card"
            style={{
              background:'#0f172a',
              borderRadius:16,
              maxWidth:380,
              width:'90%',
              margin:'0 auto',
              boxShadow:'0 18px 40px rgba(0,0,0,.55)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div style={{fontWeight:700}}>
                ⭐ {rating.toFixed ? rating.toFixed(1) : rating} out of 5
              </div>
              <button
                type="button"
                onClick={() => setShowRatingPopup(false)}
                style={{border:'none',background:'transparent',color:'#9ca3af',cursor:'pointer',fontSize:18}}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div style={{fontSize:13,color:'#9ca3af',marginBottom:12}}>
              {reviewStats.count} customer ratings
            </div>
            {[5,4,3,2,1].map(star => {
              const count = ratingDist[star as 1|2|3|4|5] || 0
              const pct = reviewStats.count ? Math.round((count / reviewStats.count) * 100) : 0
              return (
                <div key={star} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,marginBottom:6}}>
                  <span style={{width:40}}>{star} star</span>
                  <div style={{flex:1,height:8,borderRadius:999,background:'#020617',overflow:'hidden',border:'1px solid #1f2937'}}>
                    <div
                      style={{
                        width:`${pct}%`,
                        height:'100%',
                        background:'linear-gradient(90deg,#22c55e,#fbbf24)',
                      }}
                    />
                  </div>
                  <span style={{width:32,textAlign:'right',fontSize:12,color:'#9ca3af'}}>{pct}%</span>
                </div>
              )
            })}
            <div style={{marginTop:10,fontSize:12,color:'#60a5fa'}}>Detailed feedback comes from actual service bookings in this demo.</div>
          </div>
        </div>
      )}
      <div style={{marginTop:12}}>
        <Link to="/search" className="btn">Back to Search</Link>
      </div>
    </div>
  )
}
