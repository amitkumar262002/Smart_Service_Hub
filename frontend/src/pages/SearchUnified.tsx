import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { THEME, COLORS, SPACING, RADIUS, SHADOWS, TRANSITIONS } from '@/styles/theme'
import { useTheme } from '@/context/ThemeContext'

export default function SearchUnified() {
  const nav = useNavigate()
  const { isDark } = useTheme()
  const theme = isDark ? THEME.dark : THEME.light
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [ratingFilter, setRatingFilter] = useState(0)
  const [sortBy, setSortBy] = useState('rating')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [category, setCategory] = useState('all')
  const [savedFilters, setSavedFilters] = useState<any[]>([])
  const [showSavedFilters, setShowSavedFilters] = useState(false)

  const categories = ['all', 'Plumbing', 'Electrical', 'Cleaning', 'Painting', 'AC Repair', 'Carpentry']

  // Save current filters
  const saveCurrentFilter = () => {
    const filterName = `Filter ${savedFilters.length + 1}`
    const newFilter = {
      id: Date.now(),
      name: filterName,
      category,
      priceRange,
      ratingFilter
    }
    setSavedFilters([...savedFilters, newFilter])
  }

  // Load saved filter
  const loadSavedFilter = (filter: any) => {
    setCategory(filter.category)
    setPriceRange(filter.priceRange)
    setRatingFilter(filter.ratingFilter)
    setShowSavedFilters(false)
  }

  // Delete saved filter
  const deleteSavedFilter = (id: number) => {
    setSavedFilters(savedFilters.filter(f => f.id !== id))
  }

  // Handle Book Now
  const handleBookNow = (serviceId: number) => {
    nav(`/book/${serviceId}`)
  }

  const services = [
    { id: 1, title: 'Fix leaking tap', category: 'Plumbing', provider: 'Raj Plumbing', price: 499, rating: 4.8, reviews: 342, image: '🔧', verified: true, responseTime: 15, jobs: 2340 },
    { id: 2, title: 'Electrical wiring', category: 'Electrical', provider: 'Sharma Electrical', price: 899, rating: 4.9, reviews: 567, image: '⚡', verified: true, responseTime: 20, jobs: 3450 },
    { id: 3, title: 'Deep cleaning', category: 'Cleaning', provider: 'Clean Masters', price: 1299, rating: 4.7, reviews: 892, image: '🧹', verified: true, responseTime: 30, jobs: 5670 },
    { id: 4, title: 'Interior painting', category: 'Painting', provider: 'Color Experts', price: 2499, rating: 4.6, reviews: 234, image: '🎨', verified: true, responseTime: 45, jobs: 1890 },
    { id: 5, title: 'AC repair', category: 'AC Repair', provider: 'Cool Tech', price: 599, rating: 4.7, reviews: 456, image: '❄️', verified: true, responseTime: 25, jobs: 2100 },
    { id: 6, title: 'Carpentry work', category: 'Carpentry', provider: 'Wood Masters', price: 1899, rating: 4.5, reviews: 178, image: '🪚', verified: true, responseTime: 50, jobs: 890 },
  ]

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
      {/* Main Content */}
      <div style={{ 
        maxWidth: '100%',
        margin: 0,
        padding: SPACING.xl,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'visible'
      }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: SPACING.md, color: theme.text.primary, margin: 0 }}>
          🔍 Search Services
        </h1>
        <p style={{ color: theme.text.tertiary, marginBottom: SPACING.xxxl }}>
          Found {services.length} service{services.length !== 1 ? 's' : ''}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: SPACING.xxl }}>
          {/* Sidebar Filters */}
          <div style={{
            background: theme.bg.secondary,
            borderRadius: RADIUS.xl,
            padding: SPACING.xl,
            height: 'fit-content',
            boxShadow: SHADOWS.md,
            border: `1px solid ${theme.border}`
          }}>
            <h3 style={{ margin: `0 0 ${SPACING.xl} 0`, fontSize: '16px', fontWeight: 'bold', color: theme.text.primary }}>
              🔧 Filters
            </h3>

            {/* Category Filter */}
            <div style={{ marginBottom: SPACING.xl }}>
              <label style={{ display: 'block', marginBottom: SPACING.md, fontSize: '12px', fontWeight: 'bold', color: theme.text.primary }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: SPACING.md,
                  borderRadius: RADIUS.md,
                  border: `1px solid ${theme.border}`,
                  fontSize: '13px',
                  background: theme.bg.primary,
                  color: theme.text.primary,
                  cursor: 'pointer'
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div style={{ marginBottom: SPACING.xl }}>
              <label style={{ display: 'block', marginBottom: SPACING.md, fontSize: '12px', fontWeight: 'bold', color: theme.text.primary }}>
                Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
              </label>
              <input
                type="range"
                min="0"
                max="5000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                style={{ width: '100%' }}
              />
            </div>

            {/* Rating Filter */}
            <div style={{ marginBottom: SPACING.xl }}>
              <label style={{ display: 'block', marginBottom: SPACING.md, fontSize: '12px', fontWeight: 'bold', color: theme.text.primary }}>
                Minimum Rating: {ratingFilter}⭐
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

            {/* Buttons */}
            <div style={{ display: 'flex', gap: SPACING.sm, marginBottom: SPACING.md }}>
              <button
                onClick={() => {
                  setPriceRange([0, 5000])
                  setRatingFilter(0)
                  setCategory('all')
                }}
                style={{
                  flex: 1,
                  padding: SPACING.md,
                  background: theme.bg.tertiary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: RADIUS.md,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  color: theme.text.primary,
                  transition: TRANSITIONS.base
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = theme.bg.hover)}
                onMouseLeave={(e) => (e.currentTarget.style.background = theme.bg.tertiary)}
              >
                🔄 Reset
              </button>
              <button
                onClick={saveCurrentFilter}
                style={{
                  flex: 1,
                  padding: SPACING.md,
                  background: COLORS.primary,
                  border: 'none',
                  borderRadius: RADIUS.md,
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  color: '#fff',
                  transition: TRANSITIONS.base
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.primaryDark)}
                onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.primary)}
              >
                💾 Save
              </button>
            </div>

            {/* Saved Filters Button */}
            <button
              onClick={() => setShowSavedFilters(!showSavedFilters)}
              style={{
                width: '100%',
                padding: SPACING.md,
                background: savedFilters.length > 0 ? COLORS.success : theme.bg.tertiary,
                border: `1px solid ${theme.border}`,
                borderRadius: RADIUS.md,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                color: savedFilters.length > 0 ? '#fff' : theme.text.primary,
                transition: TRANSITIONS.base,
                marginBottom: SPACING.md
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              📌 Saved Filters ({savedFilters.length})
            </button>

            {/* Saved Filters List */}
            {showSavedFilters && savedFilters.length > 0 && (
              <div style={{
                background: theme.bg.tertiary,
                borderRadius: RADIUS.md,
                padding: SPACING.md,
                marginBottom: SPACING.md,
                border: `1px solid ${theme.border}`,
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {savedFilters.map(filter => (
                  <div
                    key={filter.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: SPACING.sm,
                      marginBottom: SPACING.sm,
                      background: theme.bg.secondary,
                      borderRadius: RADIUS.sm,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: TRANSITIONS.base
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = theme.bg.hover)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = theme.bg.secondary)}
                  >
                    <div
                      onClick={() => loadSavedFilter(filter)}
                      style={{ flex: 1, color: COLORS.primary, fontWeight: 'bold' }}
                    >
                      {filter.name}
                    </div>
                    <button
                      onClick={() => deleteSavedFilter(filter.id)}
                      style={{
                        background: COLORS.danger,
                        color: '#fff',
                        border: 'none',
                        borderRadius: RADIUS.sm,
                        padding: `${SPACING.sm} ${SPACING.md}`,
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        transition: TRANSITIONS.base
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Results Section */}
          <div>
            {/* Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: SPACING.xl,
              background: theme.bg.secondary,
              padding: SPACING.lg,
              borderRadius: RADIUS.xl,
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ display: 'flex', gap: SPACING.md, alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: theme.text.primary }}>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: `${SPACING.sm} ${SPACING.md}`,
                    borderRadius: RADIUS.md,
                    border: `1px solid ${theme.border}`,
                    fontSize: '13px',
                    background: theme.bg.primary,
                    color: theme.text.primary,
                    cursor: 'pointer'
                  }}
                >
                  <option value="rating">⭐ Highest Rating</option>
                  <option value="price-low">💰 Price: Low to High</option>
                  <option value="price-high">💰 Price: High to Low</option>
                  <option value="reviews">📝 Most Reviews</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: SPACING.sm }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: `${SPACING.sm} ${SPACING.md}`,
                    background: viewMode === 'grid' ? COLORS.primary : theme.bg.tertiary,
                    color: viewMode === 'grid' ? '#fff' : theme.text.primary,
                    border: 'none',
                    borderRadius: RADIUS.sm,
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: TRANSITIONS.base
                  }}
                >
                  ⊞ Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: `${SPACING.sm} ${SPACING.md}`,
                    background: viewMode === 'list' ? COLORS.primary : theme.bg.tertiary,
                    color: viewMode === 'list' ? '#fff' : theme.text.primary,
                    border: 'none',
                    borderRadius: RADIUS.sm,
                    cursor: 'pointer',
                    fontSize: '13px',
                    transition: TRANSITIONS.base
                  }}
                >
                  ≡ List
                </button>
              </div>
            </div>

            {/* Services Grid/List */}
            <div style={{
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
              flexDirection: viewMode === 'list' ? 'column' : undefined,
              gap: SPACING.xl
            }}>
              {services.map(service => (
                <div
                  key={service.id}
                  style={{
                    background: theme.bg.secondary,
                    borderRadius: RADIUS.xl,
                    overflow: 'hidden',
                    boxShadow: SHADOWS.sm,
                    transition: TRANSITIONS.slow,
                    cursor: 'pointer',
                    border: `1px solid ${theme.border}`,
                    display: viewMode === 'list' ? 'flex' : undefined,
                    gap: viewMode === 'list' ? SPACING.lg : undefined
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = SHADOWS.lg
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = SHADOWS.sm
                  }}
                >
                  {/* Image */}
                  <div style={{
                    background: COLORS.gradient,
                    padding: viewMode === 'list' ? '30px' : '40px',
                    textAlign: 'center',
                    fontSize: viewMode === 'list' ? '50px' : '60px',
                    minWidth: viewMode === 'list' ? '120px' : undefined,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {service.image}
                  </div>

                  {/* Content */}
                  <div style={{ padding: SPACING.lg, flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: SPACING.md }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: theme.text.primary }}>
                        {service.title}
                      </h3>
                      {service.verified && (
                        <span style={{
                          background: COLORS.success,
                          color: '#fff',
                          padding: `${SPACING.sm} ${SPACING.md}`,
                          borderRadius: RADIUS.sm,
                          fontSize: '11px',
                          fontWeight: 'bold'
                        }}>
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <p style={{ margin: `0 0 ${SPACING.md} 0`, fontSize: '12px', color: theme.text.tertiary }}>
                      {service.provider}
                    </p>

                    {/* Stats */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: viewMode === 'list' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
                      gap: SPACING.md,
                      marginBottom: SPACING.md,
                      fontSize: '12px'
                    }}>
                      <div>
                        <div style={{ color: theme.text.tertiary, marginBottom: SPACING.sm }}>Rating</div>
                        <div style={{ fontWeight: 'bold', color: theme.text.primary }}>⭐ {service.rating}</div>
                      </div>
                      <div>
                        <div style={{ color: theme.text.tertiary, marginBottom: SPACING.sm }}>Reviews</div>
                        <div style={{ fontWeight: 'bold', color: theme.text.primary }}>{service.reviews}</div>
                      </div>
                      <div>
                        <div style={{ color: theme.text.tertiary, marginBottom: SPACING.sm }}>Response</div>
                        <div style={{ fontWeight: 'bold', color: COLORS.success }}>⚡ {service.responseTime}m</div>
                      </div>
                      <div>
                        <div style={{ color: theme.text.tertiary, marginBottom: SPACING.sm }}>Jobs</div>
                        <div style={{ fontWeight: 'bold', color: theme.text.primary }}>{service.jobs}</div>
                      </div>
                    </div>

                    {/* Price & Button */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: COLORS.primary }}>
                        ₹{service.price}
                      </div>
                      <button
                        onClick={() => handleBookNow(service.id)}
                        style={{
                          padding: `${SPACING.sm} ${SPACING.lg}`,
                          background: COLORS.primary,
                          color: '#fff',
                          border: 'none',
                          borderRadius: RADIUS.md,
                          cursor: 'pointer',
                          fontWeight: 'bold',
                          fontSize: '13px',
                          transition: TRANSITIONS.base
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = COLORS.primaryDark
                          e.currentTarget.style.transform = 'scale(1.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = COLORS.primary
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        🎯 Book Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
