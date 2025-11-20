import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SubscriptionsAPI, PaymentsAPI } from '@/api/client'
import { getSessionUser } from '@/auth'

type Plan = {
  id: string
  name: string
  price: number
  billing_cycle: 'monthly' | 'yearly'
  description: string
  features: string[]
  color: string
  icon: string
  popular?: boolean
}

export default function SubscriptionPlans() {
  const nav = useNavigate()
  const user = getSessionUser()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'stripe' | 'googlepay' | 'phonepay' | 'amazonpay'>('razorpay')
  const [processingPayment, setProcessingPayment] = useState(false)
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  const mockPlans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: 299,
      billing_cycle: 'monthly',
      description: 'Perfect for getting started',
      icon: '🚀',
      color: '#3b82f6',
      features: [
        '✓ Up to 5 services',
        '✓ Basic analytics',
        '✓ Email support',
        '✓ Standard profile',
        '✓ Monthly billing',
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 799,
      billing_cycle: 'monthly',
      description: 'For growing businesses',
      icon: '⭐',
      color: '#f59e0b',
      popular: true,
      features: [
        '✓ Up to 20 services',
        '✓ Advanced analytics',
        '✓ Priority support',
        '✓ Premium profile badge',
        '✓ Featured listings',
        '✓ Real-time notifications',
        '✓ Monthly billing',
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 1999,
      billing_cycle: 'monthly',
      description: 'For established providers',
      icon: '👑',
      color: '#8b5cf6',
      features: [
        '✓ Unlimited services',
        '✓ Custom analytics',
        '✓ 24/7 dedicated support',
        '✓ Platinum profile badge',
        '✓ Top featured listings',
        '✓ Real-time notifications',
        '✓ API access',
        '✓ Custom branding',
        '✓ Monthly billing',
      ]
    }
  ]

  useEffect(() => {
    setLoading(false)
    setPlans(mockPlans)
  }, [])

  async function handlePayment(planId: string) {
    if (!user) {
      nav('/login')
      return
    }

    setSelectedPlan(planId)
    setProcessingPayment(true)

    try {
      const plan = plans.find(p => p.id === planId)
      if (!plan) return

      const amount = plan.price

      if (paymentMethod === 'razorpay') {
        // Razorpay integration
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${btoa('YOUR_RAZORPAY_KEY:YOUR_RAZORPAY_SECRET')}`
          },
          body: JSON.stringify({
            amount: amount * 100,
            currency: 'INR',
            receipt: `subscription_${planId}_${Date.now()}`,
            notes: {
              plan_id: planId,
              user_id: user.id,
              plan_name: plan.name
            }
          })
        })

        const order = await response.json()

        if (order.id) {
          // Open Razorpay checkout
          const options = {
            key: 'YOUR_RAZORPAY_KEY',
            amount: amount * 100,
            currency: 'INR',
            name: 'Smart Service Hub',
            description: `${plan.name} Plan Subscription`,
            order_id: order.id,
            handler: async (response: any) => {
              // Verify payment and subscribe
              await SubscriptionsAPI.subscribe(user.id, planId)
              alert('Subscription successful!')
              nav('/provider')
            },
            prefill: {
              email: user.email,
              contact: (user as any).phone || ''
            },
            theme: {
              color: '#667eea'
            }
          }

          // @ts-ignore
          const rzp = new window.Razorpay(options)
          rzp.open()
        }
      } else if (paymentMethod === 'stripe') {
        // Stripe integration
        const response = await PaymentsAPI.startStripe(user.id, amount, {
          successUrl: `${window.location.origin}/provider?subscription=success&plan=${planId}`,
          cancelUrl: `${window.location.origin}/subscriptions`
        })
        if (response?.url) {
          window.location.href = response.url
        }
      } else if (paymentMethod === 'googlepay') {
        // Google Pay integration
        const paymentRequest = {
          apiVersion: 2,
          apiVersionMinor: 0,
          allowedPaymentMethods: [{
            type: 'CARD',
            parameters: {
              allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
              allowedCardNetworks: ['MASTERCARD', 'VISA']
            },
            tokenizationSpecification: {
              type: 'PAYMENT_GATEWAY',
              parameters: {
                gateway: 'stripe',
                gatewayMerchantId: 'YOUR_STRIPE_MERCHANT_ID'
              }
            }
          }],
          merchantInfo: {
            merchantName: 'Smart Service Hub',
            merchantId: 'YOUR_MERCHANT_ID'
          },
          transactionInfo: {
            totalPriceStatus: 'FINAL',
            totalPrice: amount.toString(),
            currencyCode: 'INR'
          }
        }

        // @ts-ignore
        const paymentsClient = new google.payments.api.PaymentsClient({ environment: 'PRODUCTION' })
        const paymentData = await paymentsClient.loadPaymentData(paymentRequest)
        
        // Process payment
        await SubscriptionsAPI.subscribe(user.id, planId)
        alert('Subscription successful!')
        nav('/provider')
      } else if (paymentMethod === 'phonepay') {
        // PhonePe integration
        const merchantTransactionId = `subscription_${planId}_${Date.now()}`
        const response = await fetch('https://api.phonepe.com/apis/hermes/pg/v1/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': 'YOUR_PHONEPE_CHECKSUM'
          },
          body: JSON.stringify({
            request: btoa(JSON.stringify({
              merchantId: 'YOUR_MERCHANT_ID',
              merchantTransactionId: merchantTransactionId,
              merchantUserId: user.id,
              amount: amount * 100,
              redirectUrl: `${window.location.origin}/provider?subscription=success&plan=${planId}`,
              redirectMode: 'REDIRECT',
              callbackUrl: `${window.location.origin}/api/subscriptions/phonepay/callback`,
              mobileNumber: (user as any).phone || '',
              paymentInstrument: {
                type: 'NETBANKING',
                netBankingCode: 'OTHE'
              }
            }))
          })
        })

        const data = await response.json()
        if (data.success && data.data.instrumentResponse.redirectInfo.url) {
          window.location.href = data.data.instrumentResponse.redirectInfo.url
        }
      } else if (paymentMethod === 'amazonpay') {
        // Amazon Pay integration
        const response = await fetch('https://mws.amazonservices.com/doc/GetMerchantAccountStatus', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            'Action': 'SetOrderReferenceDetails',
            'AmazonOrderReferenceId': 'YOUR_ORDER_REFERENCE_ID',
            'OrderReferenceAttributes.OrderTotal.Amount': amount.toString(),
            'OrderReferenceAttributes.OrderTotal.CurrencyUnit': 'INR',
            'OrderReferenceAttributes.SellerNote': `${plan.name} Plan Subscription`
          }).toString()
        })

        // Process payment
        await SubscriptionsAPI.subscribe(user.id, planId)
        alert('Subscription successful!')
        nav('/provider')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setProcessingPayment(false)
    }
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: '#fff'
      }}>
        <h1 style={{ fontSize: '40px', marginBottom: '12px', fontWeight: 'bold' }}>
          💎 Subscription Plans
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.95, marginBottom: '20px' }}>
          Choose the perfect plan to grow your business
        </p>

        {/* Billing Cycle Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setBillingCycle('monthly')}
            style={{
              padding: '10px 24px',
              background: billingCycle === 'monthly' ? '#fff' : 'rgba(255,255,255,0.2)',
              color: billingCycle === 'monthly' ? '#667eea' : '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            📅 Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            style={{
              padding: '10px 24px',
              background: billingCycle === 'yearly' ? '#fff' : 'rgba(255,255,255,0.2)',
              color: billingCycle === 'yearly' ? '#667eea' : '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s ease'
            }}
          >
            🎁 Yearly (Save 20%)
          </button>
        </div>
      </div>

      {/* Plans Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '18px', color: '#888' }}>Loading plans...</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {plans.map(plan => (
            <div
              key={plan.id}
              style={{
                background: plan.popular ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)' : 'rgba(102, 126, 234, 0.05)',
                border: plan.popular ? '2px solid #f59e0b' : '1px solid rgba(102, 126, 234, 0.2)',
                borderRadius: '12px',
                padding: '32px 24px',
                position: 'relative',
                transition: 'all 0.3s ease',
                transform: plan.popular ? 'scale(1.05)' : 'scale(1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(102, 126, 234, 0.2)'
                e.currentTarget.style.transform = plan.popular ? 'scale(1.07)' : 'scale(1.02)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = plan.popular ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)',
                  color: '#fff',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  ⭐ MOST POPULAR
                </div>
              )}

              <div style={{ fontSize: '40px', marginBottom: '12px' }}>{plan.icon}</div>

              <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                {plan.name}
              </h3>

              <p style={{ color: '#888', marginBottom: '16px', fontSize: '14px' }}>
                {plan.description}
              </p>

              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: plan.color,
                marginBottom: '4px'
              }}>
                ₹{billingCycle === 'yearly' ? Math.round(plan.price * 12 * 0.8) : plan.price}
              </div>

              <div style={{
                fontSize: '12px',
                color: '#888',
                marginBottom: '24px'
              }}>
                per {billingCycle === 'yearly' ? 'year' : 'month'}
              </div>

              {/* Features List */}
              <div style={{
                marginBottom: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {plan.features.map((feature, idx) => (
                  <div key={idx} style={{
                    fontSize: '13px',
                    color: '#888',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ color: plan.color }}>✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              {/* Subscribe Button */}
              <button
                onClick={() => handlePayment(plan.id)}
                disabled={processingPayment && selectedPlan === plan.id}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: plan.color,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  opacity: processingPayment && selectedPlan === plan.id ? 0.6 : 1
                }}
                onMouseEnter={(e) => {
                  if (!(processingPayment && selectedPlan === plan.id)) {
                    e.currentTarget.style.transform = 'scale(1.02)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
              >
                {processingPayment && selectedPlan === plan.id ? '⏳ Processing...' : 'Subscribe Now'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment Methods */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.05)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '12px',
        padding: '32px 24px',
        marginBottom: '40px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
          💳 Payment Methods
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {[
            { id: 'razorpay', name: 'Razorpay', icon: '🔷' },
            { id: 'stripe', name: 'Stripe', icon: '💳' },
            { id: 'googlepay', name: 'Google Pay', icon: '🔵' },
            { id: 'phonepay', name: 'PhonePe', icon: '📱' },
            { id: 'amazonpay', name: 'Amazon Pay', icon: '🛒' }
          ].map(method => (
            <button
              key={method.id}
              onClick={() => setPaymentMethod(method.id as any)}
              style={{
                padding: '16px',
                background: paymentMethod === method.id ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'rgba(255,255,255,0.05)',
                border: paymentMethod === method.id ? '2px solid #667eea' : '1px solid rgba(102, 126, 234, 0.2)',
                borderRadius: '8px',
                cursor: 'pointer',
                color: paymentMethod === method.id ? '#fff' : '#888',
                fontWeight: 'bold',
                fontSize: '13px',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '24px' }}>{method.icon}</span>
              {method.name}
            </button>
          ))}
        </div>

        <div style={{
          padding: '12px',
          background: 'rgba(34, 197, 94, 0.1)',
          border: '1px solid rgba(34, 197, 94, 0.3)',
          borderRadius: '6px',
          color: '#22c55e',
          fontSize: '13px'
        }}>
          ✓ All payments are secure and encrypted. Your payment information is never stored on our servers.
        </div>
      </div>

      {/* FAQ Section */}
      <div style={{
        background: 'rgba(102, 126, 234, 0.05)',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        borderRadius: '12px',
        padding: '32px 24px'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>
          ❓ Frequently Asked Questions
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {[
            {
              q: 'Can I change my plan anytime?',
              a: 'Yes! You can upgrade or downgrade your plan anytime. Changes take effect immediately.'
            },
            {
              q: 'Is there a free trial?',
              a: 'Yes! Get 7 days free trial with the Professional plan. No credit card required.'
            },
            {
              q: 'What if I cancel?',
              a: 'You can cancel anytime. No questions asked. Your subscription ends at the end of the billing period.'
            },
            {
              q: 'Do you offer refunds?',
              a: '30-day money-back guarantee if you\'re not satisfied with our service.'
            },
            {
              q: 'Can I get a custom plan?',
              a: 'Yes! Contact our sales team for enterprise solutions tailored to your needs.'
            },
            {
              q: 'What payment methods do you accept?',
              a: 'We accept Razorpay, Stripe, Google Pay, PhonePe, Amazon Pay, and more.'
            }
          ].map((item, idx) => (
            <div key={idx}>
              <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#667eea' }}>
                {item.q}
              </div>
              <div style={{ fontSize: '13px', color: '#888' }}>
                {item.a}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Support Section */}
      <div style={{
        textAlign: 'center',
        marginTop: '40px',
        padding: '40px 20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: '#fff'
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '24px', fontWeight: 'bold' }}>
          Need Help?
        </h3>
        <p style={{ marginBottom: '20px', fontSize: '15px', opacity: 0.95 }}>
          Our support team is here to help you 24/7
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            padding: '10px 24px',
            background: '#fff',
            color: '#667eea',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px'
          }}>
            📧 Email Support
          </button>
          <button style={{
            padding: '10px 24px',
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px'
          }}>
            💬 Live Chat
          </button>
          <button style={{
            padding: '10px 24px',
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.5)',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px'
          }}>
            📞 Call Us
          </button>
        </div>
      </div>
    </div>
  )
}
