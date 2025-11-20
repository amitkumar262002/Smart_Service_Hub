import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { api } from '@/api/client'
import { saveSessionUser } from '@/auth'

export default function LoginSignup() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/'
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'user'|'provider'>('user')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError] = useState<string|undefined>()
  const [success, setSuccess] = useState<string|undefined>()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(undefined)
    setSuccess(undefined)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Please enter an email')
      return
    }
    if (!password) {
      setError('Please enter a password')
      return
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      let firebaseUser: any

      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password)
        firebaseUser = cred.user
      } else {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password)
        firebaseUser = cred.user
      }

      const res = await api.post('/api/auth/login', {
        email: trimmedEmail,
        name: name || firebaseUser?.displayName || '',
        phone: phone || '',
        role,
        firebase_uid: firebaseUser?.uid,
      })
      const user = res.data.user
      saveSessionUser(user)
      setSuccess(mode === 'signup' ? 'Account created and logged in.' : 'Logged in successfully.')
      navigate(from, { replace: true })
      setPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed. Please check your details.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError(undefined)
    setSuccess(undefined)
    setLoadingGoogle(true)
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      const cred = await signInWithPopup(auth, provider)
      const firebaseUser = cred.user
      const emailFromGoogle = (firebaseUser.email || '').trim().toLowerCase()
      if (!emailFromGoogle) {
        throw new Error('No email returned from Google account.')
      }
      const res = await api.post('/api/auth/login', {
        email: emailFromGoogle,
        name: firebaseUser.displayName || '',
        phone: '',
        role,
        firebase_uid: firebaseUser.uid,
      })
      const user = res.data.user
      saveSessionUser(user)
      setSuccess('Logged in with Google account.')
      navigate(from, { replace: true })
    } catch (err: any) {
      const msg = err?.message || 'Google sign-in failed. Please try again.'
      setError(msg)
    } finally {
      setLoadingGoogle(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        animation: 'slideUp 0.5s ease-out'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '32px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '40px',
            marginBottom: '12px'
          }}>
            🏠
          </div>
          <h1 style={{
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            Smart Service Hub
          </h1>
          <p style={{
            margin: 0,
            fontSize: '13px',
            opacity: 0.9
          }}>
            Book trusted local services
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '32px 24px' }}>
          {/* Mode Tabs */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => setMode('login')}
              style={{
                padding: '12px 16px',
                background: mode === 'login' ? '#667eea' : '#f3f4f6',
                color: mode === 'login' ? '#fff' : '#666',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: mode === 'login' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (mode !== 'login') {
                  e.currentTarget.style.background = '#e5e7eb'
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== 'login') {
                  e.currentTarget.style.background = '#f3f4f6'
                }
              }}
            >
              🔐 Login
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              style={{
                padding: '12px 16px',
                background: mode === 'signup' ? '#667eea' : '#f3f4f6',
                color: mode === 'signup' ? '#fff' : '#666',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: mode === 'signup' ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (mode !== 'signup') {
                  e.currentTarget.style.background = '#e5e7eb'
                }
              }}
              onMouseLeave={(e) => {
                if (mode !== 'signup') {
                  e.currentTarget.style.background = '#f3f4f6'
                }
              }}
            >
              ✨ Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'block', fontWeight: '600' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#667eea'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'block', fontWeight: '600' }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'block', fontWeight: '600' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'block', fontWeight: '600' }}>
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#667eea'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'block', fontWeight: '600' }}>
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'all 0.3s ease',
                    outline: 'none'
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#667eea'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', color: '#666', marginBottom: '6px', display: 'block', fontWeight: '600' }}>
                I am a...
              </label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'user'|'provider')}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  background: '#fff',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#667eea'
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <option value="user">👤 Customer</option>
                <option value="provider">🔧 Service Provider</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px 16px',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '8px',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                }
              }}
            >
              {loading
                ? (mode === 'signup' ? '⏳ Creating account…' : '⏳ Signing in…')
                : (mode === 'signup' ? '✨ Create Account' : '🔐 Login')}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '24px 0',
            color: '#ccc'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ fontSize: '12px', color: '#999' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loading}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: '#fff',
              color: '#333',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: loadingGoogle || loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loadingGoogle || loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loadingGoogle && !loading) {
                e.currentTarget.style.borderColor = '#667eea'
                e.currentTarget.style.background = '#f9fafb'
              }
            }}
            onMouseLeave={(e) => {
              if (!loadingGoogle && !loading) {
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.background = '#fff'
              }
            }}
          >
            <span style={{ fontSize: '18px' }}>🔵</span>
            {loadingGoogle ? 'Connecting to Google…' : 'Continue with Google'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            margin: '0 24px 24px 24px',
            padding: '12px 14px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#dc2626',
            fontSize: '13px',
            animation: 'slideDown 0.3s ease-out'
          }}>
            ❌ {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            margin: '0 24px 24px 24px',
            padding: '12px 14px',
            background: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '8px',
            color: '#16a34a',
            fontSize: '13px',
            animation: 'slideDown 0.3s ease-out'
          }}>
            ✅ {success}
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          textAlign: 'center',
          borderTop: '1px solid #f3f4f6',
          fontSize: '12px',
          color: '#999'
        }}>
          By continuing, you agree to our Terms of Service
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
