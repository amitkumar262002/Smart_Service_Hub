import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { BookingsAPI, ReviewsAPI } from '@/api/client'
import { getSessionUserId } from '@/auth'

type Booking = {
  id: string
  status: string
  payment_status?: string
  amount?: number
  datetime?: string
  createdAt?: string
  address?: string
  service_title?: string
  service_price?: number
  provider_name?: string
}

const STATUS_ORDER: Record<string, number> = {
  pending: 1,
  confirmed: 2,
  scheduled: 3,
  on_the_way: 3,
  completed: 4,
  finished: 4,
  cancelled: 5,
  canceled: 5,
}

export default function BookingDetail() {
  const { bookingId } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [reschedOpen, setReschedOpen] = useState(false)
  const [reschedDt, setReschedDt] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      if (!bookingId) return
      try {
        const b = await BookingsAPI.get(bookingId)
        setBooking(b)
      } catch (e:any) {
        setErr(e?.message || 'Failed to load booking')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [bookingId])

  function toBadge(status: string) {
    const s = (status || '').toLowerCase()
    if (['completed','finished'].includes(s)) return { label: 'Completed', tone: '#022c22', border: '#22c55e' }
    if (['pending','confirmed','scheduled','on_the_way'].includes(s)) return { label: 'Upcoming', tone: '#111827', border: '#fbbf24' }
    if (['cancelled','canceled'].includes(s)) return { label: 'Cancelled', tone: '#450a0a', border: '#f87171' }
    return { label: status || 'Unknown', tone: '#020617', border: '#4b5563' }
  }

  const badge = booking ? toBadge(booking.status) : null
  const when = booking?.datetime || booking?.createdAt || ''
  const dt = when ? new Date(when) : null
  const whenLabel = dt ? dt.toLocaleString() : when

  const steps = ['pending','confirmed','scheduled','on_the_way','completed']
  const activeStatus = (booking?.status || '').toLowerCase()

  const canCancel = ['pending','confirmed','scheduled'].includes(activeStatus)
  const canResched = !['cancelled','canceled','completed','finished'].includes(activeStatus)
  const canReview = ['completed','finished'].includes(activeStatus)

  const paymentStatus = (booking?.payment_status || '').toLowerCase()
  const isPaid = ['paid','cod'].includes(paymentStatus)

  async function confirmCancel() {
    if (!bookingId || !booking) return
    setSaving(true)
    try {
      const updated = await BookingsAPI.updateStatus(bookingId, { status: 'cancelled' })
      setBooking(updated)
      setCancelOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function confirmReschedule() {
    if (!bookingId || !booking || !reschedDt) return
    setSaving(true)
    try {
      const updated = await BookingsAPI.updateStatus(bookingId, { status: 'scheduled', datetime: reschedDt })
      setBooking(updated)
      setReschedOpen(false)
    } finally {
      setSaving(false)
    }
  }

  async function submitReview() {
    if (!bookingId) return
    setSaving(true)
    try {
      await ReviewsAPI.create(bookingId, rating, comment || '')
      setReviewOpen(false)
      setComment('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 8px 0', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          📋 Booking Details
        </h1>
        <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0' }}>View and manage your booking</p>
      </div>

      {loading && (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#d1d5db' }}>⏳ Loading booking details...</div>
        </div>
      )}
      {err && !loading && (
        <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '2px solid #dc2626', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '14px', color: '#fca5a5' }}>❌ {err}</div>
        </div>
      )}
      {!loading && !booking && !err && (
        <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#d1d5db' }}>🔍 Booking not found</div>
        </div>
      )}
      {booking && (
        <>
          {/* Main Booking Card */}
          <div style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)', border: '1px solid #374151', borderRadius: '12px', padding: '24px', marginBottom: '20px' }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:16}}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#f3f4f6', marginBottom: '12px' }}>
                  Booking #{booking.id.slice(0, 8).toUpperCase()}
                </div>
                <div style={{ display: 'grid', gap: '10px' }}>
                  {whenLabel && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#d1d5db' }}>
                      <span>📅</span> <strong>{new Date(booking.datetime || booking.createdAt || '').toLocaleString()}</strong>
                    </div>
                  )}
                  {booking.address && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#d1d5db' }}>
                      <span>📍</span> <strong>{booking.address}</strong>
                    </div>
                  )}
                  {booking.service_title && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#d1d5db' }}>
                      <span>🔧</span> <strong>{booking.service_title}</strong>
                    </div>
                  )}
                  {booking.provider_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#d1d5db' }}>
                      <span>👤</span> <strong>{booking.provider_name}</strong>
                    </div>
                  )}
                </div>
              </div>
              {badge && (
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      background: badge.tone,
                      border: `2px solid ${badge.border}`,
                      borderRadius: '8px',
                      padding: '8px 16px',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: badge.border,
                      textTransform: 'uppercase'
                    }}
                  >
                    {badge.label}
                  </div>
                </div>
              )}
            </div>

            {/* Amount & Payment */}
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #4b5563', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {booking.service_price || booking.amount ? (
                <div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>💰 Amount</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>₹ {booking.service_price || booking.amount}</div>
                </div>
              ) : null}
              {paymentStatus && (
                <div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>💳 Payment Status</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: isPaid ? '#10b981' : '#f59e0b', textTransform: 'capitalize' }}>
                    {isPaid ? '✅' : '⏳'} {paymentStatus}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{marginTop:16,display:'flex',flexWrap:'wrap',gap:10}}>
              <button 
                className="btn" 
                type="button" 
                onClick={()=>nav('/bookings')} 
                style={{ background: '#374151', color: '#f3f4f6', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s' }}
                onMouseOver={e => ((e.target as HTMLElement).style.background = '#4b5563')}
                onMouseOut={e => ((e.target as HTMLElement).style.background = '#374151')}
              >
                ← Back to Bookings
              </button>
              <button 
                className="btn" 
                type="button" 
                onClick={()=>nav(`/track/${booking.id}`)} 
                style={{ background: '#667eea', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s' }}
                onMouseOver={e => ((e.target as HTMLElement).style.background = '#5568d3')}
                onMouseOut={e => ((e.target as HTMLElement).style.background = '#667eea')}
              >
                📍 Track booking
              </button>
              {activeStatus === 'pending' && (
                <button 
                  className="btn" 
                  type="button" 
                  onClick={()=>nav(`/pay/${booking.id}`)} 
                  style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s' }}
                  onMouseOver={e => ((e.target as HTMLElement).style.background = '#059669')}
                  onMouseOut={e => ((e.target as HTMLElement).style.background = '#10b981')}
                >
                  💳 Pay now
                </button>
              )}
              {canCancel && (
                <button 
                  className="btn" 
                  type="button" 
                  onClick={()=>setCancelOpen(true)} 
                  style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s' }}
                  onMouseOver={e => ((e.target as HTMLElement).style.background = '#dc2626')}
                  onMouseOut={e => ((e.target as HTMLElement).style.background = '#ef4444')}
                >
                  ❌ Cancel
                </button>
              )}
              {canResched && (
                <button 
                  className="btn" 
                  type="button" 
                  onClick={()=>{
                    setReschedOpen(true)
                    setReschedDt(booking.datetime || '')
                  }} 
                  style={{ background: '#f59e0b', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s' }}
                  onMouseOver={e => ((e.target as HTMLElement).style.background = '#d97706')}
                  onMouseOut={e => ((e.target as HTMLElement).style.background = '#f59e0b')}
                >
                  📅 Reschedule
                </button>
              )}
              {canReview && (
                <button 
                  className="btn" 
                  type="button" 
                  onClick={()=>setReviewOpen(true)} 
                  style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.3s' }}
                  onMouseOver={e => ((e.target as HTMLElement).style.background = '#7c3aed')}
                  onMouseOut={e => ((e.target as HTMLElement).style.background = '#8b5cf6')}
                >
                  ⭐ Rate & Review
                </button>
              )}
            </div>
          </div>

          {isPaid && (
            <div className="card" id="invoice">
              <div className="card-title">Invoice</div>
              <div className="card-sub">Payment summary for this booking.</div>
              <div style={{marginTop:8,fontSize:14}}>
                <div>Booking ID: {booking.id}</div>
                {booking.service_title && <div>Service: {booking.service_title}</div>}
                {booking.provider_name && <div>Provider: {booking.provider_name}</div>}
                {whenLabel && <div>Date: {whenLabel}</div>}
                <div style={{marginTop:4}}>Amount paid: ₹ {booking.service_price || booking.amount || '—'}</div>
                <div style={{fontSize:12,color:'#9ca3af',marginTop:4}}>Payment method: {paymentStatus}</div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-title">Status timeline</div>
            <div className="card-sub">From pending to completion.</div>
            <div style={{marginTop:12,display:'flex',flexDirection:'column',gap:10}}>
              {steps.map((step, idx) => {
                const orderActive = STATUS_ORDER[activeStatus] || 0
                const orderStep = STATUS_ORDER[step] || 0
                const done = orderStep <= orderActive && orderStep !== 0
                const label = step.replace(/_/g,' ')
                return (
                  <div key={step} style={{display:'flex',alignItems:'center',gap:10}}>
                    <div
                      style={{
                        width:28,
                        height:28,
                        borderRadius:'999px',
                        display:'flex',
                        alignItems:'center',
                        justifyContent:'center',
                        background: done ? '#4ade80' : '#020617',
                        border: done ? 'none' : '1px solid #4b5563',
                        color: done ? '#022c22' : '#e5e7eb',
                        fontSize:13,
                        fontWeight:600,
                      }}
                    >
                      {idx+1}
                    </div>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,textTransform:'capitalize'}}>{label}</div>
                      <div style={{fontSize:11,color:'#9ca3af'}}>
                        {done ? 'Completed' : idx === 0 ? 'Created' : 'Waiting'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cancel Modal - Advanced Popup */}
          {cancelOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: '#1f2937', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid #374151', animation: 'slideUp 0.3s ease' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#fecaca' }}>❌ Cancel Booking</div>
                  <button onClick={() => setCancelOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                </div>

                {/* Content */}
                <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 20px 0' }}>Are you sure you want to cancel this booking? This action cannot be undone.</p>

                {/* Reason Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#f3f4f6', marginBottom: '8px' }}>Reason for cancellation (optional)</label>
                  <select
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: '1px solid #374151', borderRadius: '8px', background: '#111827', color: '#f3f4f6', fontSize: '14px' }}
                  >
                    <option value="">Select reason...</option>
                    <option value="plan_changed">📅 Plans changed</option>
                    <option value="booked_elsewhere">🏢 Booked elsewhere</option>
                    <option value="price_issue">💰 Price too high</option>
                    <option value="provider_issue">⚠️ Provider issue</option>
                    <option value="other">📝 Other</option>
                  </select>
                </div>

                {/* Booking Info */}
                <div style={{ background: '#111827', borderRadius: '8px', padding: '12px', marginBottom: '20px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Booking ID</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#f3f4f6' }}>{booking?.id}</div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    disabled={saving} 
                    onClick={confirmCancel} 
                    style={{ flex: 1, background: '#dc2626', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', opacity: saving ? 0.6 : 1, transition: 'all 0.3s' }}
                    onMouseOver={e => !saving && ((e.target as HTMLElement).style.background = '#b91c1c')}
                    onMouseOut={e => !saving && ((e.target as HTMLElement).style.background = '#dc2626')}
                  >
                    {saving ? '⏳ Cancelling...' : '✓ Confirm Cancel'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setCancelOpen(false)} 
                    style={{ flex: 1, background: '#374151', color: '#f3f4f6', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s' }}
                    onMouseOver={e => ((e.target as HTMLElement).style.background = '#4b5563')}
                    onMouseOut={e => ((e.target as HTMLElement).style.background = '#374151')}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reschedule Modal - Advanced Popup */}
          {reschedOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: '#1f2937', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid #374151' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#fcd34d' }}>📅 Reschedule Booking</div>
                  <button onClick={() => setReschedOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                </div>

                {/* Content */}
                <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 20px 0' }}>Pick a new date and time for this booking. The provider will be notified of the change.</p>

                {/* Current Booking Info */}
                <div style={{ background: '#111827', borderRadius: '8px', padding: '12px', marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Current Booking</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#f3f4f6' }}>{booking?.datetime ? new Date(booking.datetime).toLocaleString() : 'Not set'}</div>
                </div>

                {/* Date/Time Input */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#f3f4f6', marginBottom: '8px' }}>New Date & Time *</label>
                  <input
                    type="datetime-local"
                    value={reschedDt}
                    onChange={e => setReschedDt(e.target.value)}
                    style={{ width: '100%', padding: '12px', border: reschedDt ? '1px solid #f59e0b' : '1px solid #374151', borderRadius: '8px', background: '#111827', color: '#f3f4f6', fontSize: '14px', boxSizing: 'border-box', transition: 'all 0.3s' }}
                  />
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    disabled={saving || !reschedDt} 
                    onClick={confirmReschedule} 
                    style={{ flex: 1, background: reschedDt ? '#f59e0b' : '#6b7280', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: reschedDt && !saving ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: '600', opacity: saving || !reschedDt ? 0.6 : 1, transition: 'all 0.3s' }}
                    onMouseOver={e => reschedDt && !saving && ((e.target as HTMLElement).style.background = '#d97706')}
                    onMouseOut={e => reschedDt && !saving && ((e.target as HTMLElement).style.background = '#f59e0b')}
                  >
                    {saving ? '⏳ Updating...' : '✓ Confirm Reschedule'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setReschedOpen(false)} 
                    style={{ flex: 1, background: '#374151', color: '#f3f4f6', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s' }}
                    onMouseOver={e => ((e.target as HTMLElement).style.background = '#4b5563')}
                    onMouseOut={e => ((e.target as HTMLElement).style.background = '#374151')}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Review Modal - Advanced Popup */}
          {reviewOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
              <div style={{ background: '#1f2937', borderRadius: '16px', padding: '32px', maxWidth: '500px', width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', border: '1px solid #374151', maxHeight: '90vh', overflowY: 'auto' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: '#d8b4fe' }}>⭐ Rate & Review</div>
                  <button onClick={() => setReviewOpen(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af' }}>✕</button>
                </div>

                {/* Content */}
                <p style={{ fontSize: '14px', color: '#d1d5db', margin: '0 0 20px 0' }}>Share your experience with this service. Your feedback helps other customers and providers.</p>

                {/* Service Info */}
                <div style={{ background: '#111827', borderRadius: '8px', padding: '12px', marginBottom: '20px', borderLeft: '4px solid #8b5cf6' }}>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Service</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#f3f4f6' }}>{booking?.service_title || 'Service'}</div>
                </div>

                {/* Rating Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#f3f4f6', marginBottom: '12px' }}>Your Rating *</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    {[5, 4, 3, 2, 1].map(r => (
                      <button
                        key={r}
                        onClick={() => setRating(r)}
                        style={{ flex: 1, padding: '12px', background: rating === r ? '#8b5cf6' : '#111827', border: rating === r ? '2px solid #d8b4fe' : '1px solid #374151', borderRadius: '8px', cursor: 'pointer', fontSize: '18px', transition: 'all 0.3s', color: rating === r ? '#fff' : '#9ca3af' }}
                        title={`${r} star${r !== 1 ? 's' : ''}`}
                      >
                        {'⭐'.repeat(r)}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>{rating} star{rating !== 1 ? 's' : ''}</div>
                </div>

                {/* Review Text */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#f3f4f6', marginBottom: '8px' }}>Your Review (Optional)</label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Tell us about your experience with this service..."
                    style={{ width: '100%', padding: '12px', border: '1px solid #374151', borderRadius: '8px', background: '#111827', color: '#f3f4f6', fontSize: '14px', minHeight: '100px', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical' }}
                  />
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{comment.length} / 500 characters</div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    type="button" 
                    disabled={saving} 
                    onClick={submitReview} 
                    style={{ flex: 1, background: '#8b5cf6', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600', opacity: saving ? 0.6 : 1, transition: 'all 0.3s' }}
                    onMouseOver={e => !saving && ((e.target as HTMLElement).style.background = '#7c3aed')}
                    onMouseOut={e => !saving && ((e.target as HTMLElement).style.background = '#8b5cf6')}
                  >
                    {saving ? '⏳ Submitting...' : '✓ Submit Review'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setReviewOpen(false)} 
                    style={{ flex: 1, background: '#374151', color: '#f3f4f6', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s' }}
                    onMouseOver={e => ((e.target as HTMLElement).style.background = '#4b5563')}
                    onMouseOut={e => ((e.target as HTMLElement).style.background = '#374151')}
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
