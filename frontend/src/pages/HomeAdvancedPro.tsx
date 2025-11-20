import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ServicesAPI, ProvidersAPI } from '@/api/client'

export default function HomeAdvancedPro() {
  const nav = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [aiQuery, setAiQuery] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState([0, 5000])
  const [rating, setRating] = useState(0)

  const categories = [
    { name: 'Plumbing', icon: '🔧', color: '#3b82f6', count: 1250 },
    { name: 'Electrical', icon: '⚡', color: '#f59e0b', count: 980 },
    { name: 'Cleaning', icon: '🧹', color: '#10b981', count: 2340 },
    { name: 'Painting', icon: '🎨', color: '#8b5cf6', count: 650 },
    { name: 'AC Repair', icon: '❄️', color: '#06b6d4', count: 890 },
    { name: 'Carpentry', icon: '🪚', color: '#ec4899', count: 540 },
    { name: 'Appliance', icon: '🔌', color: '#14b8a6', count: 720 },
    { name: 'Tutoring', icon: '📚', color: '#f97316', count: 1100 },
  ]

  const mockServices = [
    {
      id: 1,
      title: 'Fix leaking tap',
      category: 'Plumbing',
      provider: 'Raj Plumbing Services',
      price: 499,
      rating: 4.8,
      reviews: 342,
      image: '🔧',
      verified: true,
      responseTime: '15 mins',
      description: 'Professional tap repair and replacement',
      tags: ['Quick', 'Verified', 'Affordable']
    },
    {
      id: 2,
      title: 'Electrical wiring installation',
      category: 'Electrical',
      provider: 'Sharma Electrical',
      price: 899,
      rating: 4.9,
      reviews: 567,
      image: '⚡',
      verified: true,
      responseTime: '20 mins',
      description: 'Complete electrical wiring solutions',
      tags: ['Expert', 'Certified', 'Safe']
    },
    {
      id: 3,
      title: 'Deep cleaning service',
      category: 'Cleaning',
      provider: 'Clean Masters',
      price: 1299,
      rating: 4.7,
      reviews: 892,
      image: '🧹',
      verified: true,
      responseTime: '30 mins',
      description: 'Professional deep cleaning for homes',
      tags: ['Thorough', 'Eco-friendly', 'Trusted']
    },
    {
      id: 4,
      title: 'Interior painting',
      category: 'Painting',
      provider: 'Color Experts',
      price: 2499,
      rating: 4.6,
      reviews: 234,
      image: '🎨',
      verified: true,
      responseTime: '45 mins',
      description: 'Professional interior painting services',
      tags: ['Quality', 'Experienced', 'Warranty']
    },
  ]

  const mockProviders = [
    {
      id: 1,
      name: 'Raj Plumbing Services',
      category: 'Plumbing',
      rating: 4.8,
      reviews: 342,
      price: '₹499-₹1999',
      responseTime: '15 mins',
      verified: true,
      image: '🔧',
      badge: 'Top Rated',
      experience: '12 years',
      completedJobs: 2340
    },
    {
      id: 2,
      name: 'Sharma Electrical',
      category: 'Electrical',
      rating: 4.9,
      reviews: 567,
      price: '₹899-₹3999',
      responseTime: '20 mins',
      verified: true,
      image: '⚡',
      badge: 'Expert',
      experience: '15 years',
      completedJobs: 3450
    },
    {
      id: 3,
      name: 'Clean Masters',
      category: 'Cleaning',
      rating: 4.7,
      reviews: 892,
      price: '₹1299-₹4999',
      responseTime: '30 mins',
      verified: true,
      image: '🧹',
      badge: 'Most Trusted',
      experience: '8 years',
      completedJobs: 5670
    },
  ]

  async function handleSearch() {
    setLoading(true)
    try {
      const results = await ServicesAPI.list({ q: searchQuery })
      setServices(results || mockServices)
    } catch (e) {
      setServices(mockServices)
    } finally {
      setLoading(false)
    }
  }

  async function handleAIRecommend() {
    setLoading(true)
    try {
      const results = await ServicesAPI.list({ q: aiQuery })
      setServices(results || mockServices)
    } catch (e) {
      setServices(mockServices)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setProviders(mockProviders)
  }, [])

  return (
    <div style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: '60px 20px',
        textAlign: 'center'
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
          gap: '16px',
          marginBottom: '30px'
        }}>
          {/* Keyword Search */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
              🔍 Search Services
            </label>
            <input
              type="text"
              placeholder="e.g. leak in kitchen"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                marginBottom: '8px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                width: '100%',
                padding: '10px',
                background: '#fff',
                color: '#667eea',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Search Now
            </button>
          </div>

          {/* AI Recommendation */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 'bold' }}>
              🤖 AI Recommendations
            </label>
            <input
              type="text"
              placeholder="Describe your problem..."
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAIRecommend()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: 'none',
                marginBottom: '8px',
                fontSize: '14px'
              }}
            />
            <button
              onClick={handleAIRecommend}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            >
              Get Recommendations
            </button>
          </div>
        </div>

        {/* Categories */}
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ fontSize: '13px', marginBottom: '12px', fontWeight: 'bold', opacity: 0.95 }}>
            📂 Popular Categories
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name)
                  setSearchQuery(cat.name)
                  handleSearch()
                }}
                style={{
                  padding: '8px 16px',
                  background: selectedCategory === cat.name ? '#fff' : 'rgba(255,255,255,0.2)',
                  color: selectedCategory === cat.name ? '#667eea' : '#fff',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontWeight: selectedCategory === cat.name ? 'bold' : '500',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {cat.icon} {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Top Providers Section */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>⭐ Top Rated Providers</h2>
            <button
              onClick={() => nav('/search')}
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
              View All →
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px'
          }}>
            {providers.map((provider) => (
              <div
                key={provider.id}
                onClick={() => nav(`/provider/${provider.id}`)}
                style={{
                  background: '#fff',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)'
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)'
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
                  right: '12px',
                  background: '#fbbf24',
                  color: '#000',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {provider.badge}
                </div>

                {/* Provider Info */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '40px' }}>{provider.image}</div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>
                      {provider.name}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#888', marginBottom: '4px' }}>
                      {provider.category}
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#667eea' }}>
                      ⭐ {provider.rating} ({provider.reviews} reviews)
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '16px',
                  fontSize: '12px'
                }}>
                  <div>
                    <div style={{ color: '#888', marginBottom: '4px' }}>Price Range</div>
                    <div style={{ fontWeight: 'bold', color: '#000' }}>{provider.price}</div>
                  </div>
                  <div>
                    <div style={{ color: '#888', marginBottom: '4px' }}>Response Time</div>
                    <div style={{ fontWeight: 'bold', color: '#10b981' }}>⚡ {provider.responseTime}</div>
                  </div>
                  <div>
                    <div style={{ color: '#888', marginBottom: '4px' }}>Experience</div>
                    <div style={{ fontWeight: 'bold', color: '#000' }}>{provider.experience}</div>
                  </div>
                  <div>
                    <div style={{ color: '#888', marginBottom: '4px' }}>Jobs Done</div>
                    <div style={{ fontWeight: 'bold', color: '#000' }}>{provider.completedJobs.toLocaleString()}</div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  style={{
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

        {/* Services Section */}
        {services.length > 0 && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>
              🔧 Available Services
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {services.map((service) => (
                <div
                  key={service.id}
                  style={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Image */}
                  <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '40px',
                    textAlign: 'center',
                    fontSize: '60px'
                  }}>
                    {service.image}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold' }}>
                      {service.title}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#888' }}>
                      {service.description}
                    </p>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {service.tags.map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            background: '#f3f4f6',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            color: '#666'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Rating & Price */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 'bold' }}>
                          ⭐ {service.rating} ({service.reviews})
                        </div>
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          {service.provider}
                        </div>
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#667eea' }}>
                        ₹{service.price}
                      </div>
                    </div>

                    {/* Book Button */}
                    <button
                      onClick={() => nav(`/book/${service.id}`)}
                      style={{
                        width: '100%',
                        padding: '10px',
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
              ))}
            </div>
          </div>
        )}

        {/* Why Choose Us Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '60px 40px',
          borderRadius: '16px',
          marginBottom: '60px'
        }}>
          <h2 style={{ textAlign: 'center', fontSize: '32px', fontWeight: 'bold', marginBottom: '40px' }}>
            Why Choose Smart Service Hub?
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '30px'
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
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>{feature.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
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
          padding: '40px',
          background: '#f3f4f6',
          borderRadius: '12px'
        }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>
            Ready to get started?
          </h2>
          <p style={{ fontSize: '16px', color: '#888', marginBottom: '24px' }}>
            Book a service in just 3 clicks. Fast, easy, and reliable.
          </p>
          <button
            onClick={() => nav('/search')}
            style={{
              padding: '14px 32px',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: 'all 0.2s ease'
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
