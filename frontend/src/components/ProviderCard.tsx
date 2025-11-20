import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RatingStars from './RatingStars'

type Props = { provider: any }

export default function ProviderCard({ provider }: Props) {
  const nav = useNavigate()
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const id = provider.id || 'p?'
  const displayName = provider.name || `Pro ${String(id).toUpperCase()}`
  const cats: string[] = provider.categories || []
  const primaryCat = (cats[0] || '').toLowerCase()
  const rating = provider.rating || 0
  const reviewCount = provider.review_count || 0
  const responseTime = provider.response_time || '< 1 hour'
  const completionRate = provider.completion_rate || 95

  // Category-based thumbnails
  let catThumb: string | undefined
  if (primaryCat.includes('electric')) catThumb = '/images/thumbnails/electrician.jpg'
  else if (primaryCat.includes('plumb')) catThumb = '/images/thumbnails/plumber.jpg'
  else if (primaryCat.includes('clean')) catThumb = '/images/thumbnails/cleaning.jpg'
  else if (primaryCat.includes('tutor') || primaryCat.includes('math') || primaryCat.includes('study')) catThumb = '/images/thumbnails/tutor.jpg'

  const rawPic = (provider.profile_pic as string | undefined) || catThumb
  const apiBase = (import.meta as any).env.VITE_API_BASE || 'http://localhost:5000'
  const proxied = rawPic && /^https?:\/\//i.test(rawPic) ? `${apiBase}/api/proxy?url=${encodeURIComponent(rawPic)}` : rawPic
  const imgPrimary = proxied || '/images/placeholder-avatar.svg'
  const imgFallback = '/images/placeholder-avatar.svg'

  const onImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const el = e.currentTarget
    el.src = imgFallback
  }

  const handleViewProfile = () => {
    nav(`/provider/${id}`)
  }

  const handleBookNow = () => {
    nav(`/booking?provider=${id}`)
  }

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: isHovered ? '0 12px 24px rgba(102, 126, 234, 0.15)' : '0 4px 12px rgba(0,0,0,0.08)',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'pointer',
        border: '1px solid #e5e7eb'
      }}
    >
      {/* Image Section */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '200px', background: '#f3f4f6' }}>
        <img
          src={imgPrimary}
          alt={displayName}
          onError={onImgError}
          onLoad={() => setImageLoaded(true)}
          referrerPolicy="no-referrer"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease',
            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            opacity: imageLoaded ? 1 : 0.5
          }}
        />
        
        {/* Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: rating >= 4.5 ? '#10b981' : rating >= 4 ? '#f59e0b' : '#ef4444',
          color: '#fff',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          ⭐ {rating.toFixed(1)}
        </div>

        {/* Overlay */}
        {isHovered && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            <button
              onClick={handleViewProfile}
              style={{
                padding: '8px 16px',
                background: '#667eea',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#5568d3')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#667eea')}
            >
              👤 Profile
            </button>
            <button
              onClick={handleBookNow}
              style={{
                padding: '8px 16px',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#059669')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#10b981')}
            >
              📅 Book
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div style={{ padding: '16px' }}>
        {/* Name & Rating */}
        <div style={{ marginBottom: '12px' }}>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
            {displayName}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <RatingStars value={rating} />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {reviewCount} reviews
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          marginBottom: '12px',
          padding: '8px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Response</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937' }}>{responseTime}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '2px' }}>Completion</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#10b981' }}>{completionRate}%</div>
          </div>
        </div>

        {/* Categories */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {cats.slice(0, 2).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => nav(`/search?category=${encodeURIComponent(c)}`)}
                style={{
                  padding: '4px 10px',
                  background: '#f0f4ff',
                  color: '#667eea',
                  border: '1px solid #dbeafe',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#667eea'
                  e.currentTarget.style.color = '#fff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f0f4ff'
                  e.currentTarget.style.color = '#667eea'
                }}
              >
                {c}
              </button>
            ))}
            {cats.length > 2 && (
              <span style={{ fontSize: '11px', color: '#9ca3af', padding: '4px 8px' }}>
                +{cats.length - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleBookNow}
          style={{
            width: '100%',
            padding: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ✨ Book Service
        </button>
      </div>
    </div>
  )
}
