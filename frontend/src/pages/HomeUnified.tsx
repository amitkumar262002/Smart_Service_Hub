import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEME, COLORS, SPACING, RADIUS, SHADOWS, TRANSITIONS } from '@/styles/theme'
import { useTheme } from '@/context/ThemeContext'
import { ServicesAPI, ProvidersAPI, AIAPI } from '@/api/client'

export default function HomeUnified() {
  const nav = useNavigate()
  const { isDark } = useTheme()
  const theme = isDark ? THEME.dark : THEME.light
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiRecommendation, setAiRecommendation] = useState<any | null>(null)

  const categories = [
    { name: 'Plumbing', icon: '🔧', count: 1250 },
    { name: 'Electrical', icon: '⚡', count: 980 },
    { name: 'Cleaning', icon: '🧹', count: 2340 },
    { name: 'Painting', icon: '🎨', count: 650 },
    { name: 'AC Repair', icon: '❄️', count: 890 },
    { name: 'Carpentry', icon: '🪚', count: 540 },
    { name: 'Appliance', icon: '🔌', count: 720 },
    { name: 'Tutoring', icon: '📚', count: 1100 },
  ]

  useEffect(() => {
    loadServices()
    loadProviders()
  }, [])

  async function loadServices() {
    try {
      setLoading(true)
      const data = await ServicesAPI.list()
      setServices(data || [])
    } catch (e) {
      console.error('Failed to load services:', e)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  async function handleAIRecommend() {
    const query = aiQuery || searchQuery
    if (!query) return
    try {
      setLoading(true)
      const data = await AIAPI.recommend(query)
      setAiRecommendation(data || null)
    } catch (e) {
      console.error('AI recommend failed:', e)
      setAiRecommendation(null)
    } finally {
      setLoading(false)
    }
  }

  async function loadProviders() {
    try {
      const data = await ProvidersAPI.list()
      const sorted = (data || [])
        .sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 3)
      setProviders(sorted)
    } catch (e) {
      console.error('Failed to load providers:', e)
      setProviders([])
    }
  }

  async function handleSearch() {
    try {
      setLoading(true)
      const data = await ServicesAPI.list({ q: searchQuery })
      setServices(data || [])
    } catch (e) {
      console.error('Search failed:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      background: theme.bg.primary, 
      color: theme.text.primary, 
      width: '100%',
      overflow: 'visible',
      display: 'block',
      transition: `all ${TRANSITIONS.base}`,
      margin: 0,
      padding: 0
    }}>
      {/* Hero Section */}
      <div style={{
        background: COLORS.gradient,
        color: '#fff',
        padding: '60px 20px',
        textAlign: 'center',
        margin: 0,
        marginBottom: '40px'
      }}>
        <h1 style={{ fontSize: '48px', fontWeight: 'bold', margin: '0 0 12px 0' }}>
          🏠 Book Trusted Local Services
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.95, margin: '0 0 40px 0' }}>
          From plumbers to deep cleaning — verified pros with transparent pricing
        </p>

        {/* Search Section */}
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: SPACING.lg
        }}>
          <div>
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: SPACING.md,
                borderRadius: RADIUS.md,
                border: 'none',
                marginBottom: SPACING.md,
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <button
              style={{
                width: '100%',
                padding: SPACING.md,
                background: '#fff',
                color: COLORS.primary,
                border: 'none',
                borderRadius: RADIUS.md,
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: TRANSITIONS.base
              }}
              onClick={handleSearch}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Search
            </button>
          </div>
          <div>
            <input
              type="text"
              placeholder="Describe your problem..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              style={{
                width: '100%',
                padding: SPACING.md,
                borderRadius: RADIUS.md,
                border: 'none',
                marginBottom: SPACING.md,
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
            <button
              style={{
                width: '100%',
                padding: SPACING.md,
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: RADIUS.md,
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: TRANSITIONS.base
              }}
              onClick={handleAIRecommend}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            >
              AI Recommend
            </button>
          </div>
        </div>

        {/* Categories */}
        <div style={{ marginTop: '40px' }}>
          <div style={{ 
            fontSize: '14px', 
            marginBottom: SPACING.lg, 
            fontWeight: 'bold', 
            opacity: 0.95,
            letterSpacing: '0.5px'
          }}>
            📂 Popular Categories
          </div>
          <div style={{ 
            display: 'flex', 
            gap: SPACING.md, 
            flexWrap: 'wrap', 
            justifyContent: 'center',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            {categories.map(cat => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name)
                  nav(`/search?category=${encodeURIComponent(cat.name)}`)
                }}
                style={{
                  padding: `${SPACING.md} ${SPACING.lg}`,
                  background: selectedCategory === cat.name 
                    ? '#fff' 
                    : 'rgba(255,255,255,0.15)',
                  color: selectedCategory === cat.name ? COLORS.primary : '#fff',
                  border: selectedCategory === cat.name 
                    ? `2px solid #fff`
                    : '2px solid rgba(255,255,255,0.3)',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontWeight: selectedCategory === cat.name ? 'bold' : '600',
                  fontSize: '13px',
                  transition: TRANSITIONS.base,
                  boxShadow: selectedCategory === cat.name 
                    ? '0 4px 15px rgba(255,255,255,0.2)'
                    : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: SPACING.sm,
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)'
                  e.currentTarget.style.background = selectedCategory === cat.name 
                    ? '#fff' 
                    : 'rgba(255,255,255,0.25)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,255,255,0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  e.currentTarget.style.background = selectedCategory === cat.name 
                    ? '#fff' 
                    : 'rgba(255,255,255,0.15)'
                  e.currentTarget.style.boxShadow = selectedCategory === cat.name 
                    ? '0 4px 15px rgba(255,255,255,0.2)'
                    : 'none'
                }}
                title={`${cat.count} services available`}
              >
                <span style={{ fontSize: '16px' }}>{cat.icon}</span>
                <span>{cat.name}</span>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: '100%',
        margin: '0 auto',
        padding: `0 ${SPACING.lg} ${SPACING.xl} ${SPACING.lg}`,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'visible'
      }}>
        {/* Top Providers */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: SPACING.xxl, color: theme.text.primary }}>
            ⭐ Top Rated Providers
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: SPACING.xxl
          }}>
            {providers.map(provider => (
              <div
                key={provider.id}
                style={{
                  background: theme.bg.secondary,
                  border: `2px solid ${theme.border}`,
                  borderRadius: RADIUS.xl,
                  padding: SPACING.xl,
                  cursor: 'pointer',
                  transition: TRANSITIONS.slow,
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = SHADOWS.xl
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Badge */}
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: SPACING.lg,
                  background: COLORS.warning,
                  color: '#000',
                  padding: `${SPACING.sm} ${SPACING.md}`,
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {provider.badge}
                </div>

                {/* Provider Info */}
                <div style={{ display: 'flex', gap: SPACING.md, marginBottom: SPACING.lg }}>
                  <div style={{ fontSize: '40px' }}>{provider.image}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold', color: theme.text.primary }}>
                      {provider.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: theme.text.tertiary, marginBottom: SPACING.sm }}>
                      {provider.category}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: COLORS.primary }}>
                      ⭐ {provider.rating} ({provider.reviews} reviews)
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: SPACING.md,
                  marginBottom: SPACING.lg,
                  fontSize: '12px'
                }}>
                  <div>
                    <div style={{ color: theme.text.tertiary, marginBottom: SPACING.sm }}>Price Range</div>
                    <div style={{ fontWeight: 'bold', color: theme.text.primary }}>{provider.price}</div>
                  </div>
                  <div>
                    <div style={{ color: theme.text.tertiary, marginBottom: SPACING.sm }}>Response</div>
                    <div style={{ fontWeight: 'bold', color: COLORS.success }}>⚡ {provider.responseTime}</div>
                  </div>
                  <div>
                    <div style={{ color: theme.text.tertiary, marginBottom: SPACING.sm }}>Experience</div>
                    <div style={{ fontWeight: 'bold', color: theme.text.primary }}>{provider.experience}</div>
                  </div>
                  <div>
                    <div style={{ color: theme.text.tertiary, marginBottom: SPACING.sm }}>Jobs Done</div>
                    <div style={{ fontWeight: 'bold', color: theme.text.primary }}>
                      {Number(provider.jobs || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => nav(`/provider/${provider.id}`)}
                  style={{
                    width: '100%',
                    padding: SPACING.md,
                    background: COLORS.primary,
                    color: '#fff',
                    border: 'none',
                    borderRadius: RADIUS.md,
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    transition: TRANSITIONS.base
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.primaryDark)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.primary)}
                >
                  View Profile →
                </button>
              </div>
            ))}
          </div>
        </div>

        {aiRecommendation && (
          <div style={{
            marginBottom: '60px',
            background: theme.bg.secondary,
            border: `2px solid ${theme.border}`,
            borderRadius: RADIUS.xl,
            padding: SPACING.xl
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: SPACING.md, color: theme.text.primary }}>
              🎯 Smart AI Suggestions
            </h2>
            {Array.isArray(aiRecommendation.categories) && (
              <div style={{ fontSize: '13px', color: theme.text.tertiary, marginBottom: SPACING.sm }}>
                Categories: {aiRecommendation.categories.join(', ')}
              </div>
            )}
            {Array.isArray(aiRecommendation.providers) && aiRecommendation.providers.length > 0 && (
              <div style={{ marginBottom: SPACING.sm }}>
                {aiRecommendation.providers.map((p: any) => (
                  <div key={p.id} style={{ fontSize: '12px', color: theme.text.primary, marginBottom: 4 }}>
                    • {p.name} — {p.rating} ★ — {p.reason}
                  </div>
                ))}
              </div>
            )}
            {aiRecommendation.reason && (
              <div style={{ fontSize: '12px', color: theme.text.tertiary }}>
                {aiRecommendation.reason}
              </div>
            )}
          </div>
        )}

        {/* Services Section */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: SPACING.xxl, color: theme.text.primary }}>
            🔧 Available Services
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: SPACING.xl
          }}>
            {services.map(service => (
              <div
                key={service.id}
                style={{
                  background: theme.bg.secondary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: RADIUS.xl,
                  overflow: 'hidden',
                  transition: TRANSITIONS.slow,
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = SHADOWS.lg
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                {/* Image */}
                <div style={{
                  background: COLORS.gradient,
                  padding: '40px',
                  textAlign: 'center',
                  fontSize: '60px'
                }}>
                  {service.image}
                </div>

                {/* Content */}
                <div style={{ padding: SPACING.lg }}>
                  <h3 style={{ margin: `0 0 ${SPACING.md} 0`, fontSize: '16px', fontWeight: 'bold', color: theme.text.primary }}>
                    {service.title}
                  </h3>
                  <p style={{ margin: `0 0 ${SPACING.md} 0`, fontSize: '12px', color: theme.text.tertiary }}>
                    {service.provider}
                  </p>

                  {/* Stats */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: SPACING.md,
                    marginBottom: SPACING.md,
                    fontSize: '12px'
                  }}>
                    <div>
                      <div style={{ color: theme.text.tertiary, marginBottom: SPACING.sm }}>Rating</div>
                      <div style={{ fontWeight: 'bold', color: theme.text.primary }}>⭐ {service.rating}</div>
                    </div>
                    <div>
                      <div style={{ color: theme.text.tertiary, marginBottom: SPACING.sm }}>Response</div>
                      <div style={{ fontWeight: 'bold', color: COLORS.success }}>⚡ {service.responseTime}m</div>
                    </div>
                  </div>

                  {/* Price & Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.lg }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.primary }}>
                      ₹{service.price}
                    </div>
                    <button
                      onClick={() => nav(`/book/${service.id}`)}
                      style={{
                        padding: `${SPACING.sm} ${SPACING.lg}`,
                        background: COLORS.gradient,
                        color: '#fff',
                        border: 'none',
                        borderRadius: RADIUS.lg,
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px',
                        transition: TRANSITIONS.base,
                        boxShadow: SHADOWS.md,
                        display: 'flex',
                        alignItems: 'center',
                        gap: SPACING.sm
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = SHADOWS.lg
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = SHADOWS.md
                      }}
                    >
                      ✨ Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div style={{
          background: COLORS.gradient,
          color: '#fff',
          padding: '60px 40px',
          borderRadius: RADIUS.xxl,
          marginBottom: '60px'
        }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 'bold', marginBottom: SPACING.xxxl }}>
            Why Choose Smart Service Hub?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: SPACING.xxxl
          }}>
            {[
              { icon: '✓', title: 'Verified Professionals', desc: 'All providers are verified and background checked' },
              { icon: '💰', title: 'Transparent Pricing', desc: 'No hidden charges, clear pricing upfront' },
              { icon: '⚡', title: 'Quick Response', desc: 'Get service within 15-30 minutes' },
              { icon: '🛡️', title: 'Safe & Secure', desc: 'Secure payments and verified transactions' },
              { icon: '📞', title: '24/7 Support', desc: 'Customer support available round the clock' },
              { icon: '⭐', title: 'Top Rated', desc: 'Thousands of 5-star reviews from customers' }
            ].map((feature, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '40px', marginBottom: SPACING.md }}>
                  {feature.icon}
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: SPACING.md }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '13px', opacity: 0.9 }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div style={{
          textAlign: 'center',
          padding: SPACING.xxxl,
          background: theme.bg.secondary,
          borderRadius: RADIUS.xl,
          marginBottom: SPACING.xxxl,
          border: `1px solid ${theme.border}`
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: SPACING.md, color: theme.text.primary }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: '16px', color: theme.text.tertiary, marginBottom: SPACING.xl }}>
            Book a service in just 3 clicks. Fast, easy, and reliable.
          </p>
          <button
            onClick={() => nav('/search')}
            style={{
              padding: `${SPACING.md} ${SPACING.xxxl}`,
              background: COLORS.primary,
              color: '#fff',
              border: 'none',
              borderRadius: RADIUS.md,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: TRANSITIONS.base
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            Browse Services Now →
          </button>
        </div>
      </div>

    </div>
  )
}
