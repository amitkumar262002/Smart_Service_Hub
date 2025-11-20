import { useState, useEffect } from 'react'
import { AIAPI, ServicesAPI, ProvidersAPI } from '@/api/client'
import ServiceCard from '@/components/ServiceCard'
import { useI18n } from '@/i18n'
import { useNavigate } from 'react-router-dom'

export default function HomeAdvanced() {
  const { t } = useI18n()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [aiText, setAiText] = useState('')
  const [recommend, setRecommend] = useState<any | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [topProviders, setTopProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')

  const cats = ['Cleaning', 'Plumber', 'Electrician', 'Appliance Repair', 'AC Repair', 'Mechanic', 'Tutor']

  async function search() {
    setLoading(true)
    try {
      const res = await ServicesAPI.list({ q })
      setServices(res)
      setActiveCategory(q)
    } finally {
      setLoading(false)
    }
  }

  async function ai() {
    setLoading(true)
    try {
      const res = await AIAPI.recommend(aiText || q)
      setRecommend(res)
    } finally {
      setLoading(false)
    }
  }

  async function loadTopProviders() {
    try {
      const providers = await ProvidersAPI.list()
      const sorted = providers
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6)
      setTopProviders(sorted)
    } catch (e) {
      console.error('Failed to load providers:', e)
    }
  }

  useEffect(() => {
    loadTopProviders()
  }, [])

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Hero Section */}
      <section className="hero" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '40px 20px',
        borderRadius: '12px',
        marginBottom: '30px'
      }}>
        <h1 style={{ fontSize: '36px', marginBottom: '12px', textAlign: 'center' }}>
          {t('home.title')}
        </h1>
        <p style={{ fontSize: '16px', textAlign: 'center', marginBottom: '30px', opacity: 0.9 }}>
          {t('home.subtitle')}
        </p>

        {/* Search Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', opacity: 0.9 }}>Search by service</label>
            <input
              className="input"
              placeholder={t('home.searchPlaceholder')}
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && search()}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
            />
            <div style={{ marginTop: 8 }}>
              <button className="btn" onClick={search} style={{ width: '100%', background: '#fff', color: '#667eea', fontWeight: 'bold' }}>
                🔍 Search Services
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', opacity: 0.9 }}>AI Recommendations</label>
            <input
              className="input"
              placeholder={t('home.aiPlaceholder')}
              value={aiText}
              onChange={e => setAiText(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && ai()}
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}
            />
            <div style={{ marginTop: 8 }}>
              <button className="btn" onClick={ai} style={{ width: '100%', background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.5)' }}>
                🤖 Get Recommendations
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div style={{ fontSize: '12px', marginBottom: '8px', opacity: 0.9 }}>Popular Categories</div>
          <div className="chips" style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {cats.map(c => (
              <button
                key={c}
                className="chip"
                onClick={() => { setQ(c); setActiveCategory(c); ServicesAPI.list({ q: c }).then(setServices) }}
                style={{
                  padding: '6px 12px',
                  background: activeCategory === c ? '#fff' : 'rgba(255,255,255,0.2)',
                  color: activeCategory === c ? '#667eea' : '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: activeCategory === c ? 'bold' : 'normal',
                  transition: 'all 0.2s ease'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      {recommend && (
        <div className="card" style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#fff',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '20px' }}>🤖 AI Recommendations</h3>
            <button
              onClick={() => setRecommend(null)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '20px',
                width: '32px',
                height: '32px',
                borderRadius: '50%'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '6px' }}>Suggested Categories:</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {recommend.categories.map((cat: string) => (
                <span key={cat} style={{
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '6px' }}>Top Providers:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
              {recommend.providers.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => nav(`/provider/${p.id}`)}
                  style={{
                    padding: '10px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{p.name}</div>
                  <div style={{ fontSize: '12px', opacity: 0.9 }}>⭐ {p.rating} • {p.reason}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize: '12px', opacity: 0.8, fontStyle: 'italic' }}>
            {recommend.reason}
          </div>
        </div>
      )}

      {/* Top Providers Section */}
      {topProviders.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⭐ Top Rated Providers
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }}>
            {topProviders.map(p => (
              <div
                key={p.id}
                className="card"
                onClick={() => nav(`/provider/${p.id}`)}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  borderTop: '3px solid #fbbf24'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {p.categories?.join(', ') || 'Service Provider'}
                    </div>
                  </div>
                  <div style={{
                    padding: '6px 10px',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    borderRadius: '6px',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    ⭐ {(p.rating || 0).toFixed(1)}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>
                  {p.address || 'Location not specified'}
                </div>
                <button className="btn" style={{ width: '100%', marginTop: 'auto' }}>
                  View Profile →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Services Section */}
      {services.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ margin: 0 }}>
              🔍 {activeCategory ? `${activeCategory} Services` : 'Search Results'}
            </h2>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {services.length} service{services.length !== 1 ? 's' : ''} found
            </div>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '12px'
          }}>
            {services.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && services.length === 0 && !recommend && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏠</div>
          <h3 style={{ marginBottom: '8px' }}>Welcome to Smart Service Hub</h3>
          <p style={{ color: '#888', marginBottom: '20px' }}>
            Search for services, get AI recommendations, or browse top-rated providers
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {cats.slice(0, 3).map(c => (
              <button
                key={c}
                className="btn"
                onClick={() => { setQ(c); ServicesAPI.list({ q: c }).then(setServices) }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#888' }}>Loading...</div>
        </div>
      )}

      {/* Features Section */}
      <div style={{ marginTop: '40px', marginBottom: '20px' }}>
        <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>Why Choose Us?</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '12px'
        }}>
          {[
            { icon: '⭐', title: 'Top Rated', desc: 'Verified providers with excellent ratings' },
            { icon: '🛡️', title: 'Safe & Secure', desc: 'Secure payments and verified professionals' },
            { icon: '⚡', title: 'Fast Booking', desc: 'Quick and easy service booking process' },
            { icon: '💬', title: 'Live Chat', desc: 'Real-time communication with providers' },
            { icon: '📞', title: 'Video Calls', desc: 'Direct video consultation with experts' },
            { icon: '📊', title: 'Transparent', desc: 'Clear pricing and no hidden charges' }
          ].map((feature, idx) => (
            <div key={idx} className="card" style={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{feature.icon}</div>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{feature.title}</div>
              <div style={{ fontSize: '12px', color: '#888' }}>{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
