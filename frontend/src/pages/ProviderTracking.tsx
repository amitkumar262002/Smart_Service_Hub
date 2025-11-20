import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookingsAPI, api } from '@/api/client'
import MapView from '@/components/MapView'

type LiveLoc = { lat: number; lng: number }

export default function ProviderTracking() {
  const { bookingId } = useParams()
  const nav = useNavigate()
  
  const [booking, setBooking] = useState<any | null>(null)
  const [providerLoc, setProviderLoc] = useState<LiveLoc | null>(null)
  const [customerLoc, setCustomerLoc] = useState<LiveLoc | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [eta, setEta] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [refreshInterval, setRefreshInterval] = useState(5000)

  // Calculate distance between two coordinates
  function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Calculate ETA (assuming 40 km/h average speed)
  function calculateETA(distanceKm: number): number {
    const avgSpeed = 40 // km/h
    return Math.ceil((distanceKm / avgSpeed) * 60) // minutes
  }

  async function refreshTracking() {
    if (!bookingId) return
    try {
      const b = await BookingsAPI.get(bookingId)
      setBooking(b)

      // Get provider location (from booking or tracking data)
      if (b.provider_location) {
        setProviderLoc(b.provider_location)
      }

      // Get customer location
      if (b.customer_location) {
        setCustomerLoc(b.customer_location)
      }

      // Calculate distance and ETA
      if (b.provider_location && b.customer_location) {
        const dist = calculateDistance(
          b.provider_location.lat,
          b.provider_location.lng,
          b.customer_location.lat,
          b.customer_location.lng
        )
        setDistance(dist)
        setEta(calculateETA(dist))
      }

      setLastUpdated(new Date().toLocaleTimeString())
      setError(null)
    } catch (err: any) {
      setError(err?.message || 'Failed to load tracking data')
    }
  }

  useEffect(() => {
    setLoading(true)
    refreshTracking().finally(() => setLoading(false))
  }, [bookingId])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(refreshTracking, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, bookingId])

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>⏳ Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          ❌ {error}
        </div>
        <button onClick={() => nav('/provider')} style={{ padding: '8px 16px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          ← Back
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700' }}>📍 Live Tracking</h1>
        <p style={{ margin: 0, color: '#9ca3af', fontSize: '14px' }}>Track customer location and distance</p>
      </div>

      {/* Booking Info Card */}
      {booking && (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            {/* Booking Details */}
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>📅 Booking ID</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>{booking.id}</div>
              <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>🔧 Service</div>
              <div style={{ fontSize: '13px' }}>{booking.service_title || 'Service'}</div>
            </div>

            {/* Distance Info */}
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>📏 Distance</div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                {distance ? `${distance.toFixed(2)} km` : '—'}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {distance && distance < 0.5 ? '🎯 Nearby' : distance && distance < 2 ? '🚗 Approaching' : '🛣️ On the way'}
              </div>
            </div>

            {/* ETA Info */}
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>⏱️ ETA</div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                {eta ? `~${eta} min` : '—'}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {eta && eta < 5 ? '⚡ Very soon' : eta && eta < 15 ? '✓ Soon' : '⏳ In progress'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Distance & Route Card */}
      <div style={{
        background: '#1f2937',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
        border: '1px solid #374151'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: '#f3f4f6' }}>
          🗺️ Distance & Route Information
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          {/* Provider Location */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            borderRadius: '8px',
            padding: '12px',
            border: '1px solid #374151'
          }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>🚗 Your Location (Provider)</div>
            <div style={{ fontSize: '13px', color: '#f3f4f6', fontWeight: '600', marginBottom: '4px' }}>
              {providerLoc ? `${providerLoc.lat.toFixed(4)}, ${providerLoc.lng.toFixed(4)}` : 'Loading...'}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Current Position</div>
          </div>

          {/* Customer Location */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
            borderRadius: '8px',
            padding: '12px',
            border: '1px solid #374151'
          }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '8px' }}>📍 Customer Location</div>
            <div style={{ fontSize: '13px', color: '#f3f4f6', fontWeight: '600', marginBottom: '4px' }}>
              {customerLoc ? `${customerLoc.lat.toFixed(4)}, ${customerLoc.lng.toFixed(4)}` : 'Loading...'}
            </div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Destination</div>
          </div>
        </div>

        {/* Distance Breakdown */}
        <div style={{
          background: '#111827',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid #374151'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>📏 Total Distance:</span>
            <span style={{ color: '#f3f4f6', fontWeight: '600', fontSize: '14px' }}>
              {distance ? `${distance.toFixed(2)} km` : '—'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: '#9ca3af' }}>⏱️ Estimated Time:</span>
            <span style={{ color: '#f3f4f6', fontWeight: '600', fontSize: '14px' }}>
              {eta ? `${eta} minutes` : '—'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9ca3af' }}>🚗 Average Speed:</span>
            <span style={{ color: '#f3f4f6', fontWeight: '600', fontSize: '14px' }}>40 km/h</span>
          </div>
        </div>
      </div>

      {/* Map */}
      {providerLoc && (
        <div style={{
          background: '#1f2937',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          border: '1px solid #374151',
          height: '400px'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#f3f4f6' }}>
            🗺️ Live Map
          </div>
          <div style={{ height: '350px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #374151' }}>
            <MapView provider={providerLoc} user={customerLoc} distance={distance} eta={eta} status="on_the_way" />
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{
        background: '#1f2937',
        borderRadius: '12px',
        padding: '16px',
        border: '1px solid #374151',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={refreshTracking}
          style={{
            padding: '8px 16px',
            background: '#667eea',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          🔄 Refresh Now
        </button>

        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          style={{
            padding: '8px 16px',
            background: autoRefresh ? '#10b981' : '#6b7280',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600'
          }}
        >
          {autoRefresh ? '⏸️ Stop Auto' : '▶️ Auto Refresh'}
        </button>

        <select
          value={refreshInterval}
          onChange={(e) => setRefreshInterval(Number(e.target.value))}
          style={{
            padding: '8px 12px',
            background: '#374151',
            color: '#f3f4f6',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          <option value={3000}>Every 3s</option>
          <option value={5000}>Every 5s</option>
          <option value={10000}>Every 10s</option>
          <option value={15000}>Every 15s</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {lastUpdated && (
            <>
              🕐 Last updated: {lastUpdated}
            </>
          )}
        </div>
      </div>

      {/* Advanced Features */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '20px',
        border: '1px solid #6d28d9'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px', color: '#d8b4fe' }}>
          ✨ Advanced Features
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px', color: '#e9d5ff' }}>
          <div>✓ Real-time distance calculation</div>
          <div>✓ Live ETA estimation</div>
          <div>✓ Route visualization on map</div>
          <div>✓ Auto-refresh tracking</div>
          <div>✓ Customer location tracking</div>
          <div>✓ Distance breakdown</div>
        </div>
      </div>
    </div>
  )
}
