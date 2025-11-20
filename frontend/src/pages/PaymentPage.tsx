import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BookingsAPI, PaymentsAPI } from '@/api/client'
import { useI18n } from '@/i18n'
import { THEME, COLORS, SPACING, RADIUS, SHADOWS, TRANSITIONS } from '@/styles/theme'
import { useTheme } from '@/context/ThemeContext'

export default function PaymentPage() {
  const { bookingId } = useParams()
  const nav = useNavigate()
  const loc = useLocation()
  const { t } = useI18n()
  const { isDark } = useTheme()
  const theme = isDark ? THEME.dark : THEME.light
  
  const [amount, setAmount] = useState(999)
  const [order, setOrder] = useState<any|null>(null)
  const [method, setMethod] = useState<'upi'|'card'|'cod'>('upi')
  const [upi, setUpi] = useState('')
  const [card, setCard] = useState({ number:'', name:'', exp:'', cvv:'' })
  const [upiInfo, setUpiInfo] = useState<{ link: string; txId: string } | null>(null)
  const [success, setSuccess] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<any|null>(null)
  const [bookingLoading, setBookingLoading] = useState(true)

  // UPI Banks
  const upiProviders = [
    { name: 'Google Pay', icon: '🔵', upiId: 'smartservicehub@googleplay' },
    { name: 'PhonePe', icon: '📱', upiId: 'smartservicehub@ybl' },
    { name: 'Paytm', icon: '🟠', upiId: 'smartservicehub@paytm' },
    { name: 'Amazon Pay', icon: '📦', upiId: 'smartservicehub@okhdfcbank' },
    { name: 'BHIM', icon: '🏦', upiId: 'smartservicehub@upi' },
  ]

  // Banks for Card Payment
  const banks = [
    { name: 'HDFC Bank', icon: '🏦', color: '#003DA5' },
    { name: 'ICICI Bank', icon: '🏦', color: '#1E90FF' },
    { name: 'Axis Bank', icon: '🏦', color: '#FF6B35' },
    { name: 'SBI', icon: '🏦', color: '#1F4788' },
    { name: 'Kotak Bank', icon: '🏦', color: '#C41E3A' },
  ]

  // Fetch booking details
  useEffect(() => {
    async function loadBooking() {
      if (!bookingId) {
        setBookingLoading(false)
        return
      }
      try {
        const b = await BookingsAPI.get(bookingId)
        setBooking(b)
        // Set amount from booking service price
        if (b.service_price) {
          setAmount(b.service_price)
        } else if (b.amount) {
          setAmount(b.amount)
        }
      } catch (err) {
        console.error('Failed to load booking:', err)
      } finally {
        setBookingLoading(false)
      }
    }
    loadBooking()
  }, [bookingId])

  function showNotification(type: 'success' | 'error', message: string) {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  function generateUPILink(upiId: string, amount: number): string {
    return `upi://pay?pa=${upiId}&pn=SmartServiceHub&am=${amount}&tn=Service%20Payment&tr=${Date.now()}`
  }

  function openUpiIntent(upiId: string) {
    if (!upiId) return
    const link = generateUPILink(upiId, amount)
    window.location.href = link
  }

  async function createOrder() {
    const res = await PaymentsAPI.create(amount)
    setOrder(res)
  }

  function payLater() {
    nav(`/search`)
  }

  async function handlePayNow() {
    if (!bookingId) {
      nav('/bookings')
      return
    }

    setLoading(true)

    try {
      if (method === 'card') {
        const base = window.location.origin
        const res = await PaymentsAPI.startStripe(bookingId, amount, {
          successUrl: `${base}/bookings`,
          cancelUrl: `${base}/pay/${bookingId}`,
        })
        if (res?.url) {
          window.location.href = res.url
        }
        return
      }

      if (method === 'upi') {
        if (!upi) {
          showNotification('error', 'Please enter UPI ID')
          setLoading(false)
          return
        }
        const res = await PaymentsAPI.upiMock(bookingId, amount, upi)
        setUpiInfo({ link: res.upi_link, txId: res.transaction.id })
        try {
          await BookingsAPI.updateStatus(bookingId, { status: 'confirmed', payment_status: 'paid' })
        } catch {
          // ignore demo errors
        }
        setSuccess(true)
        showNotification('success', '✅ Payment successful! Redirecting to services...')
        setTimeout(() => nav('/search'), 2000)
        return
      }

      // COD
      try {
        await BookingsAPI.updateStatus(bookingId, { status: 'scheduled', payment_status: 'cod' })
      } catch {
        // ignore demo errors
      }
      setSuccess(true)
      showNotification('success', '✅ Booking confirmed! Redirecting to services...')
      setTimeout(() => nav('/search'), 2000)
    } catch (error) {
      showNotification('error', '❌ Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Smooth scroll to hash anchors when present
  useEffect(() => {
    if (loc.hash) {
      const id = loc.hash.replace('#','')
      const el = document.getElementById(id)
      if (el) {
        setTimeout(()=> el.scrollIntoView({ behavior:'smooth', block:'start' }), 50)
      }
    }
  }, [loc.hash])

  return (
    <div style={{
      background: theme.bg.primary,
      color: theme.text.primary,
      minHeight: '100vh',
      padding: SPACING.xl,
      transition: `all ${TRANSITIONS.base}`
    }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: SPACING.xl,
          right: SPACING.xl,
          background: notification.type === 'success' ? COLORS.success : COLORS.danger,
          color: '#fff',
          padding: SPACING.lg,
          borderRadius: RADIUS.md,
          boxShadow: SHADOWS.lg,
          zIndex: 1000,
          animation: 'slideIn 0.3s ease-out',
          maxWidth: '400px'
        }}>
          {notification.message}
        </div>
      )}

      <div style={{
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          marginBottom: SPACING.xxxl,
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: SPACING.md,
            background: COLORS.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            💳 Payment & Checkout
          </h1>
          <p style={{
            color: theme.text.tertiary,
            fontSize: '14px'
          }}>
            Complete your booking securely
          </p>
        </div>

        {/* Booking Details Card */}
        {!bookingLoading && booking && (
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: RADIUS.xl,
            padding: SPACING.xl,
            marginBottom: SPACING.xl,
            color: '#fff',
            boxShadow: SHADOWS.lg
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.lg, marginBottom: SPACING.lg }}>
              {/* Booking Info */}
              <div>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>📅 Booking ID</div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: SPACING.md }}>{booking.id}</div>
                
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>🔧 Service</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{booking.service_title || 'Service'}</div>
              </div>

              {/* Price Info */}
              <div>
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>💰 Amount to Pay</div>
                <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: SPACING.md }}>₹{amount}</div>
                
                <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>📍 Status</div>
                <div style={{ fontSize: '14px', fontWeight: '600', textTransform: 'capitalize' }}>{booking.status || 'Pending'}</div>
              </div>
            </div>

            {/* Booking Guide */}
            <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '8px', padding: SPACING.md, marginTop: SPACING.lg }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>📋 Booking Guide:</div>
              <div style={{ fontSize: '12px', opacity: 0.9, lineHeight: '1.6' }}>
                <div>✓ Complete payment to confirm booking</div>
                <div>✓ You'll receive booking confirmation via SMS</div>
                <div>✓ Provider will accept and start service</div>
                <div>✓ Track provider live location in real-time</div>
                <div>✓ Chat with provider during service</div>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            background: COLORS.success,
            color: '#fff',
            padding: SPACING.xl,
            borderRadius: RADIUS.xl,
            marginBottom: SPACING.xl,
            textAlign: 'center',
            boxShadow: SHADOWS.lg
          }}>
            <div style={{ fontSize: '32px', marginBottom: SPACING.md }}>✅</div>
            <h2 style={{ margin: 0, marginBottom: SPACING.sm }}>Payment Successful!</h2>
            <p style={{ margin: 0, opacity: 0.95 }}>Your booking is confirmed. Redirecting to services...</p>
          </div>
        )}

        {/* Payment Methods Tabs */}
        <div style={{
          display: 'flex',
          gap: SPACING.md,
          marginBottom: SPACING.xl,
          background: theme.bg.secondary,
          padding: SPACING.md,
          borderRadius: RADIUS.xl,
          border: `1px solid ${theme.border}`
        }}>
          {[
            { id: 'upi', label: '📱 UPI', icon: '📱' },
            { id: 'card', label: '💳 Card', icon: '💳' },
            { id: 'cod', label: '🚚 COD', icon: '🚚' }
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id as any)}
              style={{
                flex: 1,
                padding: SPACING.md,
                background: method === m.id ? COLORS.primary : 'transparent',
                color: method === m.id ? '#fff' : theme.text.primary,
                border: 'none',
                borderRadius: RADIUS.md,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                transition: TRANSITIONS.base
              }}
              onMouseEnter={(e) => {
                if (method !== m.id) e.currentTarget.style.background = theme.bg.tertiary
              }}
              onMouseLeave={(e) => {
                if (method !== m.id) e.currentTarget.style.background = 'transparent'
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Amount Section - Advanced */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          padding: SPACING.xl,
          borderRadius: RADIUS.xl,
          border: `2px solid ${COLORS.primary}`,
          marginBottom: SPACING.xl
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.lg }}>
            {/* Amount Display */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: SPACING.md,
                fontSize: '12px',
                fontWeight: 'bold',
                color: theme.text.tertiary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                💰 Amount to Pay
              </label>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                background: COLORS.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ₹{amount}
              </div>
              <div style={{
                fontSize: '12px',
                color: theme.text.tertiary,
                marginTop: SPACING.sm
              }}>
                Service Price: ₹{booking?.service_price || amount}
              </div>
            </div>

            {/* Payment Summary */}
            <div style={{
              background: theme.bg.secondary,
              padding: SPACING.lg,
              borderRadius: RADIUS.md,
              border: `1px solid ${theme.border}`
            }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: SPACING.md, color: theme.text.tertiary }}>
                📋 Payment Summary
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span>Service Charge:</span>
                <span style={{ fontWeight: '600' }}>₹{booking?.service_price || amount}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span>Platform Fee:</span>
                <span style={{ fontWeight: '600' }}>₹0</span>
              </div>
              <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '700' }}>
                <span>Total:</span>
                <span style={{ color: COLORS.primary }}>₹{amount}</span>
              </div>
            </div>
          </div>

          {/* Amount Input (Optional) */}
          <div style={{ marginTop: SPACING.lg }}>
            <label style={{
              display: 'block',
              marginBottom: SPACING.sm,
              fontSize: '12px',
              fontWeight: '600',
              color: theme.text.tertiary
            }}>
              Edit Amount (if needed)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{
                width: '100%',
                padding: SPACING.md,
                background: theme.bg.primary,
                border: `1px solid ${theme.border}`,
                borderRadius: RADIUS.md,
                color: theme.text.primary,
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* UPI Payment */}
        {method === 'upi' && (
          <div style={{
            background: theme.bg.secondary,
            padding: SPACING.xl,
            borderRadius: RADIUS.xl,
            border: `1px solid ${theme.border}`,
            marginBottom: SPACING.xl
          }}>
            <h3 style={{ margin: `0 0 ${SPACING.lg} 0`, color: theme.text.primary }}>
              📱 Select UPI Provider
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: SPACING.md,
              marginBottom: SPACING.xl
            }}>
              {upiProviders.map(provider => (
                <button
                  key={provider.name}
                  onClick={() => setUpi(provider.upiId)}
                  style={{
                    padding: SPACING.lg,
                    background: upi === provider.upiId ? COLORS.primary : theme.bg.primary,
                    color: upi === provider.upiId ? '#fff' : theme.text.primary,
                    border: `2px solid ${upi === provider.upiId ? COLORS.primary : theme.border}`,
                    borderRadius: RADIUS.md,
                    cursor: 'pointer',
                    transition: TRANSITIONS.base,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: SPACING.sm
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
                  <span style={{ fontSize: '24px' }}>{provider.icon}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '12px' }}>{provider.name}</span>
                </button>
              ))}
            </div>
            <label style={{
              display: 'block',
              marginBottom: SPACING.md,
              fontSize: '12px',
              fontWeight: 'bold',
              color: theme.text.tertiary
            }}>
              Or enter UPI ID manually:
            </label>
            <input
              type="text"
              placeholder="yourname@bank"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              style={{
                width: '100%',
                padding: SPACING.md,
                background: theme.bg.primary,
                border: `1px solid ${theme.border}`,
                borderRadius: RADIUS.md,
                color: theme.text.primary,
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        {/* Card Payment */}
        {method === 'card' && (
          <div style={{
            background: theme.bg.secondary,
            padding: SPACING.xl,
            borderRadius: RADIUS.xl,
            border: `1px solid ${theme.border}`,
            marginBottom: SPACING.xl
          }}>
            <h3 style={{ margin: `0 0 ${SPACING.lg} 0`, color: theme.text.primary }}>
              🏦 Select Bank
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: SPACING.md,
              marginBottom: SPACING.xl
            }}>
              {banks.map(bank => (
                <div
                  key={bank.name}
                  style={{
                    padding: SPACING.lg,
                    background: theme.bg.primary,
                    border: `2px solid ${theme.border}`,
                    borderRadius: RADIUS.md,
                    cursor: 'pointer',
                    transition: TRANSITIONS.base,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: SPACING.sm,
                    textAlign: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.primary
                    e.currentTarget.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = theme.border
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{bank.icon}</span>
                  <span style={{ fontWeight: 'bold', fontSize: '12px', color: COLORS.primary }}>
                    {bank.name}
                  </span>
                </div>
              ))}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: SPACING.md
            }}>
              <input
                type="text"
                placeholder="Card Number"
                value={card.number}
                onChange={(e) => setCard({...card, number: e.target.value})}
                style={{
                  padding: SPACING.md,
                  background: theme.bg.primary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: RADIUS.md,
                  color: theme.text.primary,
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                placeholder="Name on Card"
                value={card.name}
                onChange={(e) => setCard({...card, name: e.target.value})}
                style={{
                  padding: SPACING.md,
                  background: theme.bg.primary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: RADIUS.md,
                  color: theme.text.primary,
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                placeholder="MM/YY"
                value={card.exp}
                onChange={(e) => setCard({...card, exp: e.target.value})}
                style={{
                  padding: SPACING.md,
                  background: theme.bg.primary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: RADIUS.md,
                  color: theme.text.primary,
                  fontSize: '14px'
                }}
              />
              <input
                type="text"
                placeholder="CVV"
                value={card.cvv}
                onChange={(e) => setCard({...card, cvv: e.target.value})}
                style={{
                  padding: SPACING.md,
                  background: theme.bg.primary,
                  border: `1px solid ${theme.border}`,
                  borderRadius: RADIUS.md,
                  color: theme.text.primary,
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
        )}

        {/* COD Payment */}
        {method === 'cod' && (
          <div style={{
            background: theme.bg.secondary,
            padding: SPACING.xl,
            borderRadius: RADIUS.xl,
            border: `1px solid ${theme.border}`,
            marginBottom: SPACING.xl
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: SPACING.lg
            }}>
              <span style={{ fontSize: '40px' }}>🚚</span>
              <div>
                <h3 style={{ margin: 0, marginBottom: SPACING.sm, color: theme.text.primary }}>
                  Cash on Delivery
                </h3>
                <p style={{ margin: 0, color: theme.text.tertiary, fontSize: '14px' }}>
                  Pay directly to the service provider when they arrive. No online payment required.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: SPACING.md,
          marginBottom: SPACING.xl
        }}>
          <button
            onClick={handlePayNow}
            disabled={loading}
            style={{
              flex: 1,
              padding: SPACING.lg,
              background: loading ? theme.bg.tertiary : COLORS.primary,
              color: '#fff',
              border: 'none',
              borderRadius: RADIUS.md,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: TRANSITIONS.base,
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = COLORS.primaryDark
                e.currentTarget.style.transform = 'scale(1.02)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = COLORS.primary
                e.currentTarget.style.transform = 'scale(1)'
              }
            }}
          >
            {loading ? '⏳ Processing...' : '✅ Pay Now'}
          </button>
          <button
            onClick={payLater}
            style={{
              flex: 1,
              padding: SPACING.lg,
              background: theme.bg.secondary,
              color: theme.text.primary,
              border: `2px solid ${theme.border}`,
              borderRadius: RADIUS.md,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              transition: TRANSITIONS.base
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.bg.tertiary
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.bg.secondary
            }}
          >
            🔄 Continue Shopping
          </button>
        </div>

        {/* Security Info */}
        <div style={{
          background: theme.bg.secondary,
          padding: SPACING.lg,
          borderRadius: RADIUS.xl,
          border: `1px solid ${theme.border}`,
          textAlign: 'center',
          color: theme.text.tertiary,
          fontSize: '12px'
        }}>
          🔒 Your payment is secure and encrypted. We never store your card details.
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
