import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessionUser, saveSessionUser } from '@/auth'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { api } from '@/api/client'

type UserRole = 'customer' | 'provider' | 'owner'
type AuthMode = 'role-select' | 'login' | 'signup' | 'otp'

const OWNER_EMAIL = 'supermanverma@gmail.com'

export default function LoginAdvancedMultiRole() {
  const nav = useNavigate()
  const [authMode, setAuthMode] = useState<AuthMode>('role-select')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login Form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup Form
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  // Phone OTP
  const [phoneOtpMode, setPhoneOtpMode] = useState<'input' | 'verify'>('input')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [otpTimer, setOtpTimer] = useState(0)
  const [otpAttempts, setOtpAttempts] = useState(0)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password: string) => password.length >= 6
  const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone.replace(/\D/g, ''))

  // OTP Timer
  useEffect(() => {
    if (otpTimer <= 0) return
    const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpTimer])

  // Role selection handler
  function selectRole(role: UserRole) {
    setSelectedRole(role)
    setAuthMode('login')
    setError('')
    setSuccess('')
  }

  // Back to role selection
  function backToRoleSelect() {
    setAuthMode('role-select')
    setSelectedRole(null)
    setLoginEmail('')
    setLoginPassword('')
    setSignupName('')
    setSignupEmail('')
    setSignupPassword('')
    setSignupConfirmPassword('')
    setSignupPhone('')
    setError('')
    setSuccess('')
  }

  // Owner validation
  function validateOwnerEmail(email: string): boolean {
    return email.toLowerCase() === OWNER_EMAIL.toLowerCase()
  }

  async function handleLogin() {
    setError('')
    setErrors({})
    const newErrors: Record<string, string> = {}

    if (!loginEmail) newErrors.email = 'Email is required'
    else if (!validateEmail(loginEmail)) newErrors.email = 'Invalid email format'

    if (!loginPassword) newErrors.password = 'Password is required'
    else if (!validatePassword(loginPassword)) newErrors.password = 'Password must be at least 6 characters'

    // Owner validation
    if (selectedRole === 'owner' && !validateOwnerEmail(loginEmail)) {
      newErrors.email = 'Only owner email can login as owner'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      const trimmedEmail = loginEmail.trim().toLowerCase()
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, loginPassword)
      const firebaseUser = cred.user

      try {
        const res = await api.post('/api/auth/login', {
          email: trimmedEmail,
          name: firebaseUser?.displayName || trimmedEmail.split('@')[0],
          phone: '',
          role: selectedRole === 'owner' ? 'admin' : selectedRole === 'provider' ? 'provider' : 'user',
          firebase_uid: firebaseUser?.uid,
        })
        const user = res.data.user
        saveSessionUser(user)
      } catch (apiError: any) {
        const user = {
          id: firebaseUser.uid,
          email: trimmedEmail,
          name: firebaseUser?.displayName || trimmedEmail.split('@')[0],
          role: selectedRole === 'owner' ? 'admin' : selectedRole === 'provider' ? 'provider' : 'user'
        }
        saveSessionUser(user)
      }

      setSuccess('✅ Login successful! Redirecting...')
      setTimeout(() => {
        if (selectedRole === 'owner') nav('/owner')
        else if (selectedRole === 'provider') nav('/provider')
        else nav('/')
      }, 1000)
    } catch (e: any) {
      let msg = 'Login failed. Please check your details.'
      if (e?.code === 'auth/user-not-found') msg = 'Email not found. Please sign up first.'
      else if (e?.code === 'auth/wrong-password') msg = 'Incorrect password. Please try again.'
      else if (e?.code === 'auth/invalid-email') msg = 'Invalid email format.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup() {
    setError('')
    setErrors({})
    const newErrors: Record<string, string> = {}

    if (!signupName) newErrors.name = 'Name is required'
    if (!signupEmail) newErrors.email = 'Email is required'
    else if (!validateEmail(signupEmail)) newErrors.email = 'Invalid email format'

    if (!signupPassword) newErrors.password = 'Password is required'
    else if (!validatePassword(signupPassword)) newErrors.password = 'Password must be at least 6 characters'

    if (signupPassword !== signupConfirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    if (!signupPhone) newErrors.phone = 'Phone number is required'
    else if (!validatePhone(signupPhone)) newErrors.phone = 'Invalid phone number'

    if (!agreeTerms) newErrors.terms = 'You must agree to terms and conditions'

    // Owner cannot signup
    if (selectedRole === 'owner') {
      newErrors.owner = 'Owner account cannot be created. Contact administrator.'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      const trimmedEmail = signupEmail.trim().toLowerCase()
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, signupPassword)
      const firebaseUser = cred.user

      try {
        const res = await api.post('/api/auth/login', {
          email: trimmedEmail,
          name: signupName,
          phone: signupPhone,
          role: selectedRole === 'provider' ? 'provider' : 'user',
          firebase_uid: firebaseUser?.uid,
        })
        const user = res.data.user
        saveSessionUser(user)
      } catch (apiError: any) {
        const user = {
          id: firebaseUser.uid,
          email: trimmedEmail,
          name: signupName,
          phone: signupPhone,
          role: selectedRole === 'provider' ? 'provider' : 'user'
        }
        saveSessionUser(user)
      }

      setSuccess('✅ Account created successfully! Redirecting...')
      setTimeout(() => {
        if (selectedRole === 'provider') nav('/provider')
        else nav('/')
      }, 1000)
    } catch (e: any) {
      let msg = 'Signup failed. Please try again.'
      if (e?.code === 'auth/email-already-in-use') msg = 'Email already registered. Please login instead.'
      else if (e?.code === 'auth/weak-password') msg = 'Password is too weak. Use at least 6 characters.'
      else if (e?.code === 'auth/invalid-email') msg = 'Invalid email format.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function sendPhoneOTP() {
    setError('')
    if (!validatePhone(phoneNumber)) {
      setError('Invalid phone number. Enter 10 digits.')
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {}
      })

      const formattedPhone = '+91' + phoneNumber.replace(/\D/g, '')
      const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
      setConfirmationResult(result)
      setPhoneOtpMode('verify')
      setOtpTimer(20)
      setOtpAttempts(0)
      setSuccess('✅ OTP sent! Check your SMS.')
    } catch (e: any) {
      let msg = 'Failed to send OTP'
      if (e?.code === 'auth/billing-not-enabled') {
        msg = 'Phone authentication not enabled. Use Email/Password instead.'
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function verifyPhoneOTP() {
    setError('')
    if (!otpCode || otpCode.length !== 6) {
      setError('Enter valid 6-digit OTP')
      return
    }

    if (otpTimer <= 0) {
      setError('OTP expired. Request new OTP.')
      return
    }

    if (otpAttempts >= 3) {
      setError('Too many attempts. Request new OTP.')
      return
    }

    setLoading(true)
    try {
      const cred = await confirmationResult.confirm(otpCode)
      const firebaseUser = cred.user

      try {
        const res = await api.post('/api/auth/login', {
          email: firebaseUser.phoneNumber,
          name: firebaseUser?.displayName || 'User',
          phone: firebaseUser.phoneNumber,
          role: selectedRole === 'provider' ? 'provider' : 'user',
          firebase_uid: firebaseUser?.uid,
        })
        const user = res.data.user
        saveSessionUser(user)
      } catch (apiError: any) {
        const user = {
          id: firebaseUser.uid,
          email: firebaseUser.phoneNumber,
          name: 'User',
          phone: firebaseUser.phoneNumber,
          role: selectedRole === 'provider' ? 'provider' : 'user'
        }
        saveSessionUser(user)
      }

      setSuccess('✅ Login successful! Redirecting...')
      setTimeout(() => {
        if (selectedRole === 'provider') nav('/provider')
        else nav('/')
      }, 1000)
    } catch (e: any) {
      setOtpAttempts(otpAttempts + 1)
      setError(`Invalid OTP. ${3 - otpAttempts} attempts remaining.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '12px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 10px 40px',
        maxWidth: '420px',
        width: '100%',
        overflow: 'visible'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '20px 16px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: 'bold' }}>
            🔐 Smart Service Hub
          </h1>
          <p style={{ margin: '0', fontSize: '12px', opacity: 0.9 }}>
            {authMode === 'role-select' ? 'Select your role' : `${selectedRole?.toUpperCase()} ${mode}`}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Error & Success */}
          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '12px',
              fontSize: '12px'
            }}>
              ❌ {error}
            </div>
          )}
          {success && (
            <div style={{
              background: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#16a34a',
              padding: '10px',
              borderRadius: '6px',
              marginBottom: '12px',
              fontSize: '12px'
            }}>
              ✅ {success}
            </div>
          )}

          {/* Role Selection */}
          {authMode === 'role-select' && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold' }}>
                  Select Your Role:
                </label>
                <div style={{ display: 'grid', gap: '8px' }}>
                  <button
                    onClick={() => selectRole('customer')}
                    style={{
                      padding: '12px',
                      background: '#667eea',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    👤 Customer
                  </button>
                  <button
                    onClick={() => selectRole('provider')}
                    style={{
                      padding: '12px',
                      background: '#667eea',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    🔧 Provider
                  </button>
                  <button
                    onClick={() => selectRole('owner')}
                    style={{
                      padding: '12px',
                      background: '#764ba2',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '14px'
                    }}
                  >
                    👑 Owner (Admin)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Login/Signup */}
          {authMode === 'login' && selectedRole && (
            <div>
              <div style={{ marginBottom: '12px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setMode('login')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    background: mode === 'login' ? '#667eea' : '#f3f4f6',
                    color: mode === 'login' ? '#fff' : '#000',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Login
                </button>
                {selectedRole !== 'owner' && (
                  <button
                    onClick={() => setMode('signup')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: mode === 'signup' ? '#667eea' : '#f3f4f6',
                      color: mode === 'signup' ? '#fff' : '#000',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Sign Up
                  </button>
                )}
              </div>

              {/* Login Form */}
              {mode === 'login' && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.email && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>{errors.email}</div>}
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.password && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>{errors.password}</div>}
                  </div>

                  <button
                    onClick={handleLogin}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: loading ? '#ccc' : '#667eea',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      marginBottom: '12px'
                    }}
                  >
                    {loading ? '⏳ Logging in...' : '🔓 Login'}
                  </button>
                </div>
              )}

              {/* Signup Form */}
              {mode === 'signup' && selectedRole !== 'owner' && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                      Name
                    </label>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Your name"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.name && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>{errors.name}</div>}
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="your@email.com"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.email && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>{errors.email}</div>}
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={signupPhone}
                      onChange={(e) => setSignupPhone(e.target.value)}
                      placeholder="10-digit phone"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.phone && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>{errors.phone}</div>}
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                      Password
                    </label>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.password && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>{errors.password}</div>}
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px' }}>
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      placeholder="••••••"
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {errors.confirmPassword && <div style={{ color: '#dc2626', fontSize: '11px', marginTop: '4px' }}>{errors.confirmPassword}</div>}
                  </div>

                  <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label style={{ fontSize: '11px', cursor: 'pointer' }}>
                      I agree to terms and conditions
                    </label>
                  </div>
                  {errors.terms && <div style={{ color: '#dc2626', fontSize: '11px', marginBottom: '12px' }}>{errors.terms}</div>}

                  <button
                    onClick={handleSignup}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: loading ? '#ccc' : '#667eea',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold',
                      marginBottom: '12px'
                    }}
                  >
                    {loading ? '⏳ Creating account...' : '✍️ Sign Up'}
                  </button>
                </div>
              )}

              {/* Owner signup warning */}
              {mode === 'signup' && selectedRole === 'owner' && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #fcd34d',
                  color: '#92400e',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  textAlign: 'center'
                }}>
                  ⚠️ Owner account cannot be created. Contact administrator.
                </div>
              )}

              {/* Back Button */}
              <button
                onClick={backToRoleSelect}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#f3f4f6',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ← Back to Role Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* reCAPTCHA Container */}
      <div id="recaptcha-container" style={{ display: 'none' }}></div>
    </div>
  )
}
