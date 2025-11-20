import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ServicesAPI } from '@/api/client'

export default function SearchAdvancedPro() {
  const [searchParams] = useSearchParams()
  const nav = useNavigate()
  const [services, setServices] = useState<any[]>([])
  const [filteredServices, setFilteredServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [rating, setRating] = useState(0)
  const [sortBy, setSortBy] = useState('rating')
  const [category, setCategory] = useState('all')
  const [responseTime, setResponseTime] = useState('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const mockServices = [
    {
      id: 1,
      title: 'Fix leaking tap',
      category: 'Plumbing',
      provider: 'Raj Plumbing Services',
      providerId: 1,
      price: 499,
      rating: 4.8,
      reviews: 342,
      image: '🔧',
      verified: true,
      responseTime: 15,
      description: 'Professional tap repair and replacement',
      tags: ['Quick', 'Verified', 'Affordable'],
      completedJobs: 2340,
      experience: '12 years'
    },
    {
      id: 2,
      title: 'Electrical wiring installation',
      category: 'Electrical',
      provider: 'Sharma Electrical',
      providerId: 2,
      price: 899,
      rating: 4.9,
      reviews: 567,
      image: '⚡',
      verified: true,
      responseTime: 20,
      description: 'Complete electrical wiring solutions',
      tags: ['Expert', 'Certified', 'Safe'],
      completedJobs: 3450,
      experience: '15 years'
    },
    {
      id: 3,
      title: 'Deep cleaning service',
      category: 'Cleaning',
      provider: 'Clean Masters',
      providerId: 3,
      price: 1299,
      rating: 4.7,
      reviews: 892,
      image: '🧹',
      verified: true,
      responseTime: 30,
      description: 'Professional deep cleaning for homes',
      tags: ['Thorough', 'Eco-friendly', 'Trusted'],
      completedJobs: 5670,
      experience: '8 years'
    },
    {
      id: 4,
      title: 'Interior painting',
      category: 'Painting',
      provider: 'Color Experts',
      providerId: 4,
      price: 2499,
      rating: 4.6,
      reviews: 234,
      image: '🎨',
      verified: true,
      responseTime: 45,
      description: 'Professional interior painting services',
      tags: ['Quality', 'Experienced', 'Warranty'],
      completedJobs: 1890,
      experience: '10 years'
    },
    {
      id: 5,
      title: 'AC repair and maintenance',
      category: 'AC Repair',
      provider: 'Cool Tech Services',
      providerId: 5,
      price: 599,
      rating: 4.7,
      reviews: 456,
      image: '❄️',
      verified: true,
      responseTime: 25,
      description: 'Expert AC repair and maintenance',
      tags: ['Fast', 'Reliable', 'Warranty'],
      completedJobs: 2100,
      experience: '9 years'
    },
    {
      id: 6,
      title: 'Carpentry and woodwork',
      category: 'Carpentry',
      provider: 'Wood Masters',
      providerId: 6,
      price: 1899,
      rating: 4.5,
      reviews: 178,
      image: '🪚',
      verified: true,
      responseTime: 50,
      description: 'Custom carpentry and woodwork solutions',
      tags: ['Custom', 'Quality', 'Durable'],
      completedJobs: 890,
      experience: '14 years'
    },
  ]

  const categories = ['all', 'Plumbing', 'Electrical', 'Cleaning', 'Painting', 'AC Repair', 'Carpentry']
  const sortOptions = [
    { value: 'rating', label: '⭐ Highest Rating' },
    { value: 'price-low', label: '💰 Price: Low to High' },
    { value: 'price-high', label: '💰 Price: High to Low' },
    { value: 'reviews', label: '📝 Most Reviews' },
    { value: 'response', label: '⚡ Fastest Response' }
  ]

  useEffect(() => {
    setLoading(false)
    setServices(mockServices)
  }, [])

  useEffect(() => {
    let filtered = [...services]

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(s => s.category === category)
    }

    // Filter by price range
    filtered = filtered.filter(s => s.price >= priceRange[0] && s.price <= priceRange[1])

    // Filter by rating
    filtered = filtered.filter(s => s.rating >= rating)

    // Filter by response time
    if (responseTime !== 'all') {
      const maxTime = parseInt(responseTime)
      filtered = filtered.filter(s => s.responseTime <= maxTime)
    }

    // Filter by verified only
    if (verifiedOnly) {
      filtered = filtered.filter(s => s.verified)
    }

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'reviews') {
      filtered.sort((a, b) => b.reviews - a.reviews)
    } else if (sortBy === 'response') {
      filtered.sort((a, b) => a.responseTime - b.responseTime)
    }

    setFilteredServices(filtered)
  }, [services, priceRange, rating, sortBy, category, responseTime, verifiedOnly])

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 8px 0' }}>
            🔍 Search Services
          </h1>
          <p style={{ color: '#888', margin: 0 }}>
            Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
          {/* Sidebar Filters */}
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '20px',
            height: 'fit-content',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 'bold' }}>
              🔧 Filters
            </h3>

            {/* Category Filter */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px'
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
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
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
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                Minimum Rating: {rating}⭐
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            {/* Response Time Filter */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                Response Time
              </label>
              <select
                value={responseTime}
                onChange={(e) => setResponseTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px'
                }}
              >
                <option value="all">All</option>
                <option value="15">Within 15 mins</option>
                <option value="30">Within 30 mins</option>
                <option value="60">Within 1 hour</option>
              </select>
            </div>

            {/* Verified Only */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={(e) => setVerifiedOnly(e.target.checked)}
                  style={{ cursor: 'pointer' }}
                />
                <span style={{ fontSize: '13px' }}>Verified Only</span>
              </label>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setPriceRange([0, 5000])
                setRating(0)
                setCategory('all')
                setResponseTime('all')
                setVerifiedOnly(false)
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              Reset Filters
            </button>
          </div>

          {/* Main Content */}
          <div>
            {/* Controls */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              background: '#fff',
              padding: '16px',
              borderRadius: '12px'
            }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 'bold' }}>Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '13px'
                  }}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '8px 12px',
                    background: viewMode === 'grid' ? '#667eea' : '#f3f4f6',
                    color: viewMode === 'grid' ? '#fff' : '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  ⊞ Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '8px 12px',
                    background: viewMode === 'list' ? '#667eea' : '#f3f4f6',
                    color: viewMode === 'list' ? '#fff' : '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}
                >
                  ≡ List
                </button>
              </div>
            </div>

            {/* Services */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div style={{ fontSize: '16px', color: '#888' }}>Loading services...</div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                background: '#fff',
                borderRadius: '12px'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                  No services found
                </h3>
                <p style={{ color: '#888', marginBottom: '24px' }}>
                  Try adjusting your filters or search criteria
                </p>
                <button
                  onClick={() => {
                    setPriceRange([0, 5000])
                    setRating(0)
                    setCategory('all')
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#667eea',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div style={{
                display: viewMode === 'grid' ? 'grid' : 'flex',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
                flexDirection: viewMode === 'list' ? 'column' : undefined,
                gap: '20px'
              }}>
                {filteredServices.map((service) => (
                  <div
                    key={service.id}
                    style={{
                      background: '#fff',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      display: viewMode === 'list' ? 'flex' : undefined,
                      gap: viewMode === 'list' ? '16px' : undefined
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)'
                      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    {/* Image */}
                    {viewMode === 'list' && (
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '30px',
                        textAlign: 'center',
                        fontSize: '50px',
                        minWidth: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {service.image}
                      </div>
                    )}

                    {viewMode === 'grid' && (
                      <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '40px',
                        textAlign: 'center',
                        fontSize: '60px'
                      }}>
                        {service.image}
                      </div>
                    )}

                    {/* Content */}
                    <div style={{ padding: '16px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                          {service.title}
                        </h3>
                        {service.verified && (
                          <span style={{
                            background: '#10b981',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 'bold'
                          }}>
                            ✓ Verified
                          </span>
                        )}
                      </div>

                      <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#888' }}>
                        {service.description}
                      </p>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: viewMode === 'list' ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
                        gap: '12px',
                        marginBottom: '12px',
                        fontSize: '12px'
                      }}>
                        <div>
                          <div style={{ color: '#888', marginBottom: '2px' }}>Rating</div>
                          <div style={{ fontWeight: 'bold' }}>⭐ {service.rating}</div>
                        </div>
                        <div>
                          <div style={{ color: '#888', marginBottom: '2px' }}>Reviews</div>
                          <div style={{ fontWeight: 'bold' }}>{service.reviews}</div>
                        </div>
                        <div>
                          <div style={{ color: '#888', marginBottom: '2px' }}>Response</div>
                          <div style={{ fontWeight: 'bold', color: '#10b981' }}>⚡ {service.responseTime}m</div>
                        </div>
                        <div>
                          <div style={{ color: '#888', marginBottom: '2px' }}>Jobs</div>
                          <div style={{ fontWeight: 'bold' }}>{service.completedJobs}</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>
                          ₹{service.price}
                        </div>
                        <button
                          onClick={() => nav(`/book/${service.id}`)}
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
                          Book Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
