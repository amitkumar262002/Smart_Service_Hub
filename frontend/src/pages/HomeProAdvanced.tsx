import { useState, useEffect } from 'react'
import { AIAPI, ServicesAPI, ProvidersAPI } from '@/api/client'
import ServiceCard from '@/components/ServiceCard'
import { useI18n } from '@/i18n'
import { useNavigate } from 'react-router-dom'

export default function HomeProAdvanced() {
  const { t } = useI18n()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [aiText, setAiText] = useState('')
  const [recommend, setRecommend] = useState<any | null>(null)
  const [services, setServices] = useState<any[]>([])
  const [topProviders, setTopProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState('')
  const [language, setLanguage] = useState('en')
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [ratingFilter, setRatingFilter] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const cats = ['Cleaning', 'Plumber', 'Electrician', 'Appliance Repair', 'AC Repair', 'Mechanic', 'Tutor', 'Painter', 'Carpenter']

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
        .slice(0, 8)
      setTopProviders(sorted)
    } catch (e) {
      console.error('Failed to load providers:', e)
    }
  }

  useEffect(() => {
    loadTopProviders()
  }, [])

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header with Language Selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '12px',
        background: 'rgba(102, 126, 234, 0.05)',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>
          🏢 Smart Service Hub
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid #333',
            background: '#111',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
        </select>
      </div>

      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        color: '#fff',
        padding: '50px 20px',
        borderRadius: '16px',
        marginBottom: '40px',
        boxShadow: '0 20px 60px rgba(102, 126, 234, 0.3)'
      }}>
        <h1 style={{ fontSize: '48px', marginBottom: '12px', textAlign: 'center', fontWeight: 'bold' }}>
          🚀 Find Perfect Services
        </h1>
        <p style={{ fontSize: '18px', textAlign: 'center', marginBottom: '40px', opacity: 0.95 }}>
          Connect with verified professionals. Book instantly. Pay securely.
        </p>

        {/* Search Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '30px'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', opacity: 0.95 }}>
              🔍 Search Services
            </label>
            <input
              className="input"
              placeholder="Plumber, Electrician, Cleaner..."
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && search()}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontSize: '14px'
              }}
            />
            <button
              onClick={search}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '12px',
                background: '#fff',
                color: '#667eea',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Search Now
            </button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold', opacity: 0.95 }}>
              🤖 AI Recommendations
            </label>
            <input
              className="input"
              placeholder="Describe what you need..."
              value={aiText}
              onChange={e => setAiText(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && ai()}
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: '2px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontSize: '14px'
              }}
            />
            <button
              onClick={ai}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '12px',
                background: 'rgba(255,255,255,0.25)',
                color: '#fff',
                fontWeight: 'bold',
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
            >
              Get Recommendations
            </button>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div style={{ fontSize: '13px', marginBottom: '12px', fontWeight: 'bold', opacity: 0.95 }}>
            📂 Popular Categories
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {cats.map(c => (
              <button
                key={c}
                onClick={() => { setQ(c); setActiveCategory(c); ServicesAPI.list({ q: c }).then(setServices) }}
                style={{
                  padding: '8px 16px',
                  background: activeCategory === c ? '#fff' : 'rgba(255,255,255,0.2)',
                  color: activeCategory === c ? '#667eea' : '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: activeCategory === c ? 'bold' : '500',
                  transition: 'all 0.2s ease',
                  fontSize: '13px'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      {recommend && (
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: '#fff',
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '40px',
          boxShadow: '0 10px 30px rgba(245, 87, 108, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>🤖 AI Recommendations</h3>
            <button
              onClick={() => setRecommend(null)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '24px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.95 }}>Suggested Categories:</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {recommend.categories.map((cat: string) => (
                <span key={cat} style={{
                  padding: '6px 12px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', opacity: 0.95 }}>Top Providers:</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {recommend.providers.map((p: any) => (
                <div
                  key={p.id}
                  onClick={() => nav(`/provider/${p.id}`)}
                  style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    border: '1px solid rgba(255,255,255,0.2)'
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

          <div style={{ fontSize: '12px', opacity: 0.85, fontStyle: 'italic', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            {recommend.reason}
          </div>
        </div>
      )}

      {/* Top Providers Section */}
      {topProviders.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>⭐ Top Rated Providers</h2>
            <button
              onClick={() => nav('/search')}
              style={{
                padding: '8px 16px',
                background: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              View All →
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            {topProviders.map(p => (
              <div
                key={p.id}
                onClick={() => nav(`/provider/${p.id}`)}
                style={{
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  border: '2px solid rgba(102, 126, 234, 0.2)',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderTop: '4px solid #fbbf24'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-6px)'
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(102, 126, 234, 0.2)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>
                      {p.categories?.join(', ') || 'Service Provider'}
                    </div>
                  </div>
                  <div style={{
                    padding: '8px 12px',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    borderRadius: '8px',
                    color: '#000',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    ⭐ {(p.rating || 0).toFixed(1)}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>
                  📍 {p.address || 'Location not specified'}
                </div>
                <button style={{
                  width: '100%',
                  padding: '10px',
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#764ba2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#667eea')}
                >
                  View Profile →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters & View Mode */}
      {services.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          padding: '16px',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '8px 16px',
                background: showFilters ? '#667eea' : 'rgba(102, 126, 234, 0.2)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              🔧 {showFilters ? 'Hide' : 'Show'} Filters
            </button>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {services.length} service{services.length !== 1 ? 's' : ''} found
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('grid')}
              style={{
                padding: '6px 12px',
                background: viewMode === 'grid' ? '#667eea' : 'rgba(102, 126, 234, 0.2)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '6px 12px',
                background: viewMode === 'list' ? '#667eea' : 'rgba(102, 126, 234, 0.2)',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              ≡ List
            </button>
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showFilters && services.length > 0 && (
        <div style={{
          background: 'rgba(102, 126, 234, 0.05)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px', fontWeight: 'bold' }}>Advanced Filters</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                💰 Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="10000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                ⭐ Minimum Rating: {ratingFilter}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={ratingFilter}
                onChange={(e) => setRatingFilter(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
          <button
            onClick={search}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px'
            }}
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Services Section */}
      {services.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
            flexDirection: viewMode === 'list' ? 'column' : undefined,
            gap: '16px'
          }}>
            {services.map(s => <ServiceCard key={s.id} service={s} />)}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && services.length === 0 && !recommend && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏠</div>
          <h3 style={{ marginBottom: '8px', fontSize: '22px', fontWeight: 'bold' }}>Welcome to Smart Service Hub</h3>
          <p style={{ color: '#888', marginBottom: '24px', fontSize: '15px' }}>
            Search for services, get AI recommendations, or browse top-rated providers
          </p>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {cats.slice(0, 4).map(c => (
              <button
                key={c}
                onClick={() => { setQ(c); ServicesAPI.list({ q: c }).then(setServices) }}
                style={{
                  padding: '10px 20px',
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#764ba2')}
                onMouseLeave={(e) => (e.currentTarget.style.background = '#667eea')}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'rgba(102, 126, 234, 0.05)',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '18px', color: '#888', fontWeight: 'bold' }}>⏳ Loading...</div>
        </div>
      )}

      {/* Features Section */}
      <div style={{ marginTop: '60px', marginBottom: '40px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center', fontSize: '28px', fontWeight: 'bold' }}>
          Why Choose Smart Service Hub?
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {[
            { icon: '⭐', title: 'Top Rated', desc: 'Verified providers with excellent ratings and reviews' },
            { icon: '🛡️', title: 'Safe & Secure', desc: 'Secure payments and verified professionals' },
            { icon: '⚡', title: 'Fast Booking', desc: 'Quick and easy service booking process' },
            { icon: '💬', title: 'Live Chat', desc: 'Real-time communication with providers' },
            { icon: '📞', title: 'Video Calls', desc: 'Direct video consultation with experts' },
            { icon: '📊', title: 'Transparent', desc: 'Clear pricing and no hidden charges' }
          ].map((feature, idx) => (
            <div key={idx} style={{
              textAlign: 'center',
              padding: '24px',
              background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)'
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(102, 126, 234, 0.15)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            >
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{feature.icon}</div>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>{feature.title}</div>
              <div style={{ fontSize: '13px', color: '#888' }}>{feature.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '40px 20px',
        borderRadius: '12px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '24px', fontWeight: 'bold' }}>
          Ready to Get Started?
        </h3>
        <p style={{ marginBottom: '20px', fontSize: '15px', opacity: 0.95 }}>
          Find the perfect service provider in just a few clicks
        </p>
        <button
          onClick={() => setQ('')}
          style={{
            padding: '12px 32px',
            background: '#fff',
            color: '#667eea',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '15px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Start Searching Now
        </button>
      </div>
    </div>
  )
}
