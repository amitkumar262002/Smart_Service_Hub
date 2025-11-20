import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessionUser, saveSessionUser } from '@/auth'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { api } from '@/api/client'

export default function LoginSignupAdvancedPro() {
  const nav = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [userType, setUserType] = useState<'user' | 'provider'>('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Login Form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

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

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password: string) => password.length >= 6
  const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone.replace(/\D/g, ''))

  // OTP Timer Effect
  useEffect(() => {
    if (otpTimer <= 0) return
    const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpTimer])

  async function handleLogin() {
    setError('')
    setErrors({})
    const newErrors: Record<string, string> = {}

    if (!loginEmail) newErrors.email = 'Email is required'
    else if (!validateEmail(loginEmail)) newErrors.email = 'Invalid email format'

    if (!loginPassword) newErrors.password = 'Password is required'
    else if (!validatePassword(loginPassword)) newErrors.password = 'Password must be at least 6 characters'

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
          role: userType === 'provider' ? 'provider' : 'user',
          firebase_uid: firebaseUser?.uid,
        })
        const user = res.data.user
        saveSessionUser(user)
      } catch (apiError: any) {
        // If API fails, still save user locally
        const user = {
          id: firebaseUser.uid,
          email: trimmedEmail,
          name: firebaseUser?.displayName || trimmedEmail.split('@')[0],
          role: userType === 'provider' ? 'provider' : 'user'
        }
        saveSessionUser(user)
      }
      
      setSuccess('✅ Login successful! Redirecting...')
      setTimeout(() => nav('/'), 1000)
    } catch (e: any) {
      let msg = 'Login failed. Please check your details.'
      if (e?.code === 'auth/user-not-found') msg = 'Email not found. Please sign up first.'
      else if (e?.code === 'auth/wrong-password') msg = 'Incorrect password. Please try again.'
      else if (e?.code === 'auth/invalid-email') msg = 'Invalid email format.'
      else if (e?.message) msg = e.message
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
          role: userType === 'provider' ? 'provider' : 'user',
          firebase_uid: firebaseUser?.uid,
        })
        const user = res.data.user
        saveSessionUser(user)
      } catch (apiError: any) {
        // If API fails, still save user locally
        const user = {
          id: firebaseUser.uid,
          email: trimmedEmail,
          name: signupName,
          phone: signupPhone,
          role: userType === 'provider' ? 'provider' : 'user'
        }
        saveSessionUser(user)
      }
      
      setSuccess('✅ Account created successfully! Redirecting...')
      setTimeout(() => nav('/'), 1000)
    } catch (e: any) {
      let msg = 'Signup failed. Please try again.'
      if (e?.code === 'auth/email-already-in-use') msg = 'Email already registered. Please login instead.'
      else if (e?.code === 'auth/weak-password') msg = 'Password is too weak. Use at least 6 characters.'
      else if (e?.code === 'auth/invalid-email') msg = 'Invalid email format.'
      else if (e?.message) msg = e.message
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      
      try {
        const cred = await signInWithPopup(auth, provider)
        const firebaseUser = cred.user
        const emailFromGoogle = (firebaseUser.email || '').trim().toLowerCase()
        
        if (!emailFromGoogle) {
          throw new Error('No email returned from Google account.')
        }

        try {
          const res = await api.post('/api/auth/login', {
            email: emailFromGoogle,
            name: firebaseUser.displayName || '',
            phone: '',
            role: userType === 'provider' ? 'provider' : 'user',
            firebase_uid: firebaseUser.uid,
          })
          const user = res.data.user
          saveSessionUser(user)
        } catch (apiError: any) {
          // If API fails, still save user locally
          const user = {
            id: firebaseUser.uid,
            email: emailFromGoogle,
            name: firebaseUser.displayName || '',
            role: userType === 'provider' ? 'provider' : 'user'
          }
          saveSessionUser(user)
        }
        
        setSuccess('✅ Logged in with Google! Redirecting...')
        setTimeout(() => nav('/'), 1000)
      } catch (firebaseError: any) {
        // Handle Firebase domain error with fallback
        if (firebaseError?.code === 'auth/unauthorized-domain') {
          setError('⚠️ Google login requires domain authorization. Use Email/Password login for now.')
        } else if (firebaseError?.code === 'auth/popup-closed-by-user') {
          setError('Google login cancelled.')
        } else if (firebaseError?.code === 'auth/popup-blocked') {
          setError('Popup was blocked. Please enable popups.')
        } else {
          setError(firebaseError?.message || 'Google login failed. Please try again.')
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Google login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function sendPhoneOTP() {
    setError('')
    setErrors({})
    
    if (!phoneNumber) {
      setError('Please enter a phone number')
      return
    }
    
    if (!validatePhone(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      
      // Setup reCAPTCHA verifier
      const w = window as any
      if (!w.recaptchaVerifier) {
        try {
          w.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {}
          })
        } catch (recaptchaError: any) {
          setError('⚠️ reCAPTCHA setup failed. Try Email/Password login instead.')
          setPhoneOtpMode('input')
          setLoading(false)
          return
        }
      }

      // Format phone number with country code
      const formattedPhone = '+91' + phoneNumber.replace(/\D/g, '')
      
      // Send OTP
      try {
        const result = await signInWithPhoneNumber(auth, formattedPhone, w.recaptchaVerifier)
        setConfirmationResult(result)
        setPhoneOtpMode('verify')
        setOtpTimer(20) // 20-second timer
        setOtpAttempts(0)
        setSuccess('✅ OTP sent to ' + phoneNumber + '! Check your phone. (Valid for 20 seconds)')
      } catch (phoneError: any) {
        // Clear reCAPTCHA verifier on error
        w.recaptchaVerifier = null
        
        let msg = 'Failed to send OTP.'
        if (phoneError?.code === 'auth/invalid-phone-number') {
          msg = '❌ Invalid phone number. Please use 10-digit format.'
        } else if (phoneError?.code === 'auth/too-many-requests') {
          msg = '⚠️ Too many attempts. Please try again later.'
        } else if (phoneError?.code === 'auth/billing-not-enabled') {
          msg = '⚠️ Phone OTP temporarily unavailable. Use Email/Password or Google login.'
        } else if (phoneError?.code === 'auth/operation-not-allowed') {
          msg = '⚠️ Phone authentication not enabled. Use Email/Password login.'
        } else if (phoneError?.message?.includes('billing')) {
          msg = '⚠️ Phone OTP service unavailable. Use Email/Password or Google login.'
        } else {
          msg = phoneError?.message || 'Failed to send OTP. Please try again.'
        }
        setError(msg)
        setPhoneOtpMode('input')
      }
    } catch (e: any) {
      setError('❌ Error: ' + (e?.message || 'Failed to send OTP'))
      setPhoneOtpMode('input')
    } finally {
      setLoading(false)
    }
  }

  async function verifyPhoneOTP() {
    setError('')
    
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    if (!confirmationResult) {
      setError('OTP session expired. Please request a new OTP.')
      setPhoneOtpMode('input')
      return
    }

    if (otpTimer <= 0) {
      setError('OTP expired. Please request a new one.')
      setPhoneOtpMode('input')
      return
    }

    setLoading(true)
    try {
      const cred = await confirmationResult.confirm(otpCode)
      const firebaseUser = cred.user

      try {
        const res = await api.post('/api/auth/login', {
          email: firebaseUser.phoneNumber || 'phone-' + firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          phone: firebaseUser.phoneNumber || '',
          role: userType === 'provider' ? 'provider' : 'user',
          firebase_uid: firebaseUser.uid,
        })
        const user = res.data.user
        saveSessionUser(user)
      } catch (apiError: any) {
        // If API fails, still save user locally
        const user = {
          id: firebaseUser.uid,
          email: firebaseUser.phoneNumber || 'phone-' + firebaseUser.uid,
          name: firebaseUser.displayName || 'User',
          phone: firebaseUser.phoneNumber || '',
          role: userType === 'provider' ? 'provider' : 'user'
        }
        saveSessionUser(user)
      }

      setSuccess('✅ Login successful! Redirecting...')
      setTimeout(() => nav('/'), 1000)
    } catch (e: any) {
      const newAttempts = otpAttempts + 1
      setOtpAttempts(newAttempts)
      
      let msg = 'Invalid OTP. Please try again.'
      if (e?.code === 'auth/invalid-verification-code') {
        msg = `❌ Invalid OTP code (Attempt ${newAttempts}/3)`
      } else if (e?.code === 'auth/code-expired') {
        msg = '⏱️ OTP expired. Please request a new one.'
      } else if (e?.message) {
        msg = e.message
      }
      
      if (newAttempts >= 3) {
        msg += ' - Too many attempts. Please request a new OTP.'
        setPhoneOtpMode('input')
        setOtpAttempts(0)
      }
      
      setError(msg)
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
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
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
            {mode === 'login' ? '🔐 Welcome Back' : '🚀 Join Us'}
          </h1>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* User Type Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', fontWeight: 'bold' }}>
              I am a:
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                onClick={() => setUserType('user')}
                style={{
                  padding: '10px',
                  background: userType === 'user' ? '#667eea' : '#f3f4f6',
                  color: userType === 'user' ? '#fff' : '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                👤 Customer
              </button>
              <button
                onClick={() => setUserType('provider')}
                style={{
                  padding: '10px',
                  background: userType === 'provider' ? '#667eea' : '#f3f4f6',
                  color: userType === 'provider' ? '#fff' : '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  transition: 'all 0.2s ease'
                }}
              >
                🔧 Provider
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <button
              onClick={() => {
                setMode('login')
                setError('')
                setSuccess('')
              }}
              style={{
                padding: '10px',
                background: mode === 'login' ? '#667eea' : '#f3f4f6',
                color: mode === 'login' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
            >
              Login
            </button>
            <button
              onClick={() => {
                setMode('signup')
                setError('')
                setSuccess('')
              }}
              style={{
                padding: '10px',
                background: mode === 'signup' ? '#667eea' : '#f3f4f6',
                color: mode === 'signup' ? '#fff' : '#000',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '13px',
                transition: 'all 0.2s ease'
              }}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
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

          {/* Success Message */}
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
              ✓ {success}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <div>
              {/* Email */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  📧 Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: errors.email ? '2px solid #dc2626' : '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.email && (
                  <div style={{ color: '#dc2626', fontSize: '10px', marginTop: '3px' }}>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  🔒 Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: errors.password ? '2px solid #dc2626' : '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.password && (
                  <div style={{ color: '#dc2626', fontSize: '10px', marginTop: '3px' }}>
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Remember me
                </label>
              </div>

              {/* Login Button */}
              <button
                onClick={handleLogin}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: loading ? '#cbd5e1' : '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#764ba2')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#667eea')}
              >
                {loading ? '⏳ Logging in...' : '🔓 Login'}
              </button>

              {/* Forgot Password */}
              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </div>
          )}

          {/* Signup Form */}
          {mode === 'signup' && (
            <div>
              {/* Name */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  👤 Full Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: errors.name ? '2px solid #dc2626' : '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.name && (
                  <div style={{ color: '#dc2626', fontSize: '10px', marginTop: '3px' }}>
                    {errors.name}
                  </div>
                )}
              </div>

              {/* Email */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  📧 Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: errors.email ? '2px solid #dc2626' : '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.email && (
                  <div style={{ color: '#dc2626', fontSize: '10px', marginTop: '3px' }}>
                    {errors.email}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  📱 Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: errors.phone ? '2px solid #dc2626' : '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.phone && (
                  <div style={{ color: '#dc2626', fontSize: '10px', marginTop: '3px' }}>
                    {errors.phone}
                  </div>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  🔒 Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: errors.password ? '2px solid #dc2626' : '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.password && (
                  <div style={{ color: '#dc2626', fontSize: '10px', marginTop: '3px' }}>
                    {errors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  🔒 Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: errors.confirmPassword ? '2px solid #dc2626' : '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
                {errors.confirmPassword && (
                  <div style={{ color: '#dc2626', fontSize: '10px', marginTop: '3px' }}>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Terms */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer', fontSize: '11px' }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    style={{ cursor: 'pointer', marginTop: '2px' }}
                  />
                  <span>
                    I agree to the <strong>Terms & Conditions</strong> and <strong>Privacy Policy</strong>
                  </span>
                </label>
                {errors.terms && (
                  <div style={{ color: '#dc2626', fontSize: '10px', marginTop: '3px' }}>
                    {errors.terms}
                  </div>
                )}
              </div>

              {/* Signup Button */}
              <button
                onClick={handleSignup}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: loading ? '#cbd5e1' : '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#764ba2')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#667eea')}
              >
                {loading ? '⏳ Creating account...' : '🚀 Create Account'}
              </button>
            </div>
          )}

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '16px 0',
            color: '#ccc'
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
            <span style={{ fontSize: '11px', color: '#888' }}>or</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
          </div>

          {/* Social & Phone Login */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                padding: '10px',
                background: loading ? '#cbd5e1' : '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#e5e7eb')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#f3f4f6')}
            >
              🔵 Google
            </button>
            <button 
              onClick={() => {
                setPhoneOtpMode('input')
                setError('')
                setSuccess('')
              }}
              disabled={loading}
              style={{
                padding: '10px',
                background: loading ? '#cbd5e1' : '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#e5e7eb')}
              onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#f3f4f6')}
            >
              📱 Phone OTP
            </button>
          </div>

          {/* Phone OTP Form */}
          {phoneOtpMode === 'input' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                  📱 Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <button
                onClick={sendPhoneOTP}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: loading ? '#cbd5e1' : '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#764ba2')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#667eea')}
              >
                {loading ? '⏳ Sending OTP...' : '📤 Send OTP'}
              </button>
              <button
                onClick={() => setPhoneOtpMode('input')}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '10px',
                  background: '#f3f4f6',
                  color: '#000',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                ← Back
              </button>
            </div>
          )}

          {/* Phone OTP Verification */}
          {phoneOtpMode === 'verify' && (
            <div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 'bold' }}>
                    🔐 Enter OTP
                  </label>
                  <span style={{ fontSize: '10px', color: otpTimer <= 5 ? '#dc2626' : '#666' }}>
                    ⏱️ {otpTimer}s
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.slice(0, 6))}
                  maxLength={6}
                  disabled={otpTimer <= 0}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: otpTimer <= 0 ? '2px solid #dc2626' : '1px solid #e5e7eb',
                    fontSize: '12px',
                    boxSizing: 'border-box',
                    letterSpacing: '2px',
                    textAlign: 'center',
                    opacity: otpTimer <= 0 ? 0.5 : 1
                  }}
                />
                {otpAttempts > 0 && (
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '3px' }}>
                    Attempts: {otpAttempts}/3
                  </div>
                )}
              </div>
              <button
                onClick={verifyPhoneOTP}
                disabled={loading || otpTimer <= 0}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: loading || otpTimer <= 0 ? '#cbd5e1' : '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading || otpTimer <= 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '13px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => !loading && otpTimer > 0 && (e.currentTarget.style.background = '#764ba2')}
                onMouseLeave={(e) => !loading && otpTimer > 0 && (e.currentTarget.style.background = '#667eea')}
              >
                {loading ? '⏳ Verifying...' : otpTimer <= 0 ? '⏱️ OTP Expired' : '✓ Verify OTP'}
              </button>
              <button
                onClick={() => {
                  setPhoneOtpMode('input')
                  setOtpCode('')
                  setPhoneNumber('')
                  setConfirmationResult(null)
                  setOtpTimer(0)
                  setOtpAttempts(0)
                }}
                style={{
                  width: '100%',
                  marginTop: '8px',
                  padding: '10px',
                  background: '#f3f4f6',
                  color: '#000',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}
              >
                ← Request New OTP
              </button>
            </div>
          )}

          {/* reCAPTCHA Container */}
          <div id="recaptcha-container" style={{ marginTop: '12px' }} />
        </div>
      </div>
    </div>
  )
}
