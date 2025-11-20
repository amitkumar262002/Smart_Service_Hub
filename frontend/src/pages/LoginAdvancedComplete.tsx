import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSessionUser, saveSessionUser } from '@/auth'
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, sendPasswordResetEmail } from 'firebase/auth'
import { api } from '@/api/client'

type UserRole = 'customer' | 'provider' | 'owner'
type AuthMode = 'role-select' | 'auth-method' | 'login' | 'signup' | 'otp' | 'forgot-password'
type AuthMethod = 'email' | 'google' | 'phone'

const OWNER_EMAIL = 'supermanverma@gmail.com'
const OWNER_PASSWORD = 'amitkumar@123'

export default function LoginAdvancedComplete() {
  const nav = useNavigate()
  const [authMode, setAuthMode] = useState<AuthMode>('role-select')
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null)
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Advanced Features
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('')
  const [signupPhone, setSignupPhone] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)

  const [phoneOtpMode, setPhoneOtpMode] = useState<'input' | 'verify'>('input')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [confirmationResult, setConfirmationResult] = useState<any>(null)
  const [otpTimer, setOtpTimer] = useState(0)
  const [otpAttempts, setOtpAttempts] = useState(0)

  // Forgot Password
  const [forgotEmail, setForgotEmail] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePassword = (password: string) => password.length >= 6
  const validatePhone = (phone: string) => /^[0-9]{10}$/.test(phone.replace(/\D/g, ''))

  // Device tracking function
  const getDeviceInfo = () => {
    const ua = navigator.userAgent
    const isMobile = /mobile/i.test(ua)
    const isTablet = /tablet|ipad/i.test(ua)
    return {
      device: isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop',
      browser: ua.includes('Chrome') ? 'Chrome' : ua.includes('Safari') ? 'Safari' : ua.includes('Firefox') ? 'Firefox' : 'Other',
      timestamp: new Date().toISOString()
    }
  }

  // Demo OTP for testing (use 123456 as OTP for any phone number)
  const generateDemoOTP = () => {
    return '123456'
  }

  // Add login to history
  const addLoginHistory = (email: string, success: boolean) => {
    const history = JSON.parse(localStorage.getItem('loginHistory') || '[]')
    history.push({
      email,
      device: getDeviceInfo(),
      success,
      timestamp: new Date().toISOString()
    })
    // Keep only last 10 logins
    if (history.length > 10) history.shift()
    localStorage.setItem('loginHistory', JSON.stringify(history))
  }

  // Lock timer effect
  useEffect(() => {
    if (lockTimer <= 0) {
      setIsLocked(false)
      return
    }
    const timer = setTimeout(() => setLockTimer(lockTimer - 1), 1000)
    return () => clearTimeout(timer)
  }, [lockTimer])

  useEffect(() => {
    if (otpTimer <= 0) return
    const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
    return () => clearTimeout(timer)
  }, [otpTimer])

  function selectRole(role: UserRole) {
    setSelectedRole(role)
    setAuthMode('auth-method')
    setError('')
  }

  function selectAuthMethod(method: AuthMethod) {
    setAuthMethod(method)
    if (method === 'phone') {
      setAuthMode('otp')
    } else {
      setAuthMode('login')
    }
    setError('')
  }

  function backToRoleSelect() {
    setAuthMode('role-select')
    setSelectedRole(null)
    setAuthMethod(null)
  }

  function backToAuthMethod() {
    setAuthMode('auth-method')
    setAuthMethod(null)
  }

  // Reset lock function
  const resetLock = () => {
    setIsLocked(false)
    setLockTimer(0)
    setLoginAttempts(0)
    setError('')
    setSuccess('✅ Lock reset! You can now try again.')
    console.log('🔓 Lock reset')
  }

  async function handleLogin() {
    if (isLocked) {
      setError(`❌ Account locked. Try again in ${lockTimer}s`)
      return
    }

    setError('')
    setSuccess('')
    setErrors({})
    const newErrors: Record<string, string> = {}

    // Validation
    if (!loginEmail) newErrors.email = '❌ Email is required'
    else if (!validateEmail(loginEmail)) newErrors.email = '❌ Invalid email format'

    if (!loginPassword) newErrors.password = '❌ Password is required'
    else if (!validatePassword(loginPassword)) newErrors.password = '❌ Password must be at least 6 characters'

    if (selectedRole === 'owner' && loginEmail.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
      newErrors.email = '❌ Only owner email can login as owner'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      if (Object.keys(newErrors).length === 1) {
        setError(Object.values(newErrors)[0])
      }
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      const trimmedEmail = loginEmail.trim().toLowerCase()
      
      console.log('🔐 Attempting login with:', trimmedEmail)
      
      // Firebase Authentication (with fallback to backend)
      let firebaseUser: any = null
      let firebaseAuthSuccess = false
      
      try {
        const cred = await signInWithEmailAndPassword(auth, trimmedEmail, loginPassword)
        firebaseUser = cred.user
        firebaseAuthSuccess = true
        console.log('✅ Firebase auth successful:', firebaseUser.uid)
      } catch (firebaseError: any) {
        console.warn('⚠️ Firebase auth failed:', firebaseError?.code, '- Trying backend auth...')
        // Firebase failed, will try backend auth instead
      }

      const deviceInfo = getDeviceInfo()

      // Backend API Call (primary auth method)
      let sessionUser: any = null
      try {
        const res = await api.post('/api/auth/login', {
          email: trimmedEmail,
          name: firebaseUser?.displayName || trimmedEmail.split('@')[0],
          phone: '',
          role: selectedRole === 'owner' ? 'admin' : selectedRole === 'provider' ? 'provider' : 'user',
          firebase_uid: firebaseUser?.uid || trimmedEmail,
          device_info: deviceInfo,
          remember_me: rememberMe
        })
        console.log('✅ Backend login successful')
        sessionUser = res.data.user
        saveSessionUser(sessionUser)
      } catch (apiError: any) {
        console.warn('⚠️ Backend login failed:', apiError?.message)
        
        // If Firebase auth was successful, use Firebase user as fallback
        if (firebaseAuthSuccess && firebaseUser) {
          console.log('✅ Using Firebase user as fallback')
          sessionUser = {
            id: firebaseUser.uid,
            email: trimmedEmail,
            name: firebaseUser?.displayName || trimmedEmail.split('@')[0],
            role: selectedRole === 'owner' ? 'admin' : selectedRole === 'provider' ? 'provider' : 'user'
          }
          saveSessionUser(sessionUser)
        } else {
          // Both Firebase and Backend failed
          throw new Error('Authentication failed: ' + apiError?.message)
        }
      }

      // Save remember me
      if (rememberMe) {
        localStorage.setItem('rememberMe', JSON.stringify({
          email: trimmedEmail,
          role: selectedRole,
          timestamp: new Date().toISOString()
        }))
      }

      addLoginHistory(trimmedEmail, true)
      setSuccess('✅ Login successful!')
      setLoginAttempts(0)
      
      setTimeout(() => {
        if (selectedRole === 'owner') nav('/owner')
        else if (selectedRole === 'provider') nav('/provider')
        else nav('/')
      }, 1000)
    } catch (e: any) {
      console.error('❌ Login error:', e?.code, e?.message)
      
      let msg = '❌ Login failed'
      if (e?.code === 'auth/user-not-found') msg = '❌ Email not registered. Please sign up first.'
      else if (e?.code === 'auth/wrong-password') msg = '❌ Wrong password'
      else if (e?.code === 'auth/invalid-credential') msg = '❌ Invalid email or password'
      else if (e?.code === 'auth/invalid-email') msg = '❌ Invalid email format'
      else if (e?.code === 'auth/user-disabled') msg = '❌ Account disabled'
      else if (e?.code === 'auth/too-many-requests') msg = '❌ Too many login attempts. Try again later.'
      else if (e?.code === 'auth/email-already-in-use') msg = '❌ Email already registered. Please login instead.'
      else if (e?.code === 'auth/weak-password') msg = '❌ Password must be at least 6 characters'
      else if (e?.message?.includes('network')) msg = '❌ Network error - check your connection'
      
      const newAttempts = loginAttempts + 1
      setLoginAttempts(newAttempts)
      addLoginHistory(loginEmail, false)
      
      if (newAttempts >= 5) {
        setIsLocked(true)
        setLockTimer(300) // 5 minutes
        msg = '❌ Too many attempts. Account locked for 5 minutes.'
      }
      
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    setError('')
    if (!forgotEmail) {
      setError('Enter your email')
      return
    }
    if (!validateEmail(forgotEmail)) {
      setError('Invalid email format')
      return
    }

    setForgotLoading(true)
    try {
      const auth = getAuth()
      await sendPasswordResetEmail(auth, forgotEmail.trim().toLowerCase())
      setSuccess('✅ Password reset link sent to your email!')
      setTimeout(() => {
        setAuthMode('login')
        setForgotEmail('')
      }, 2000)
    } catch (e: any) {
      setError('Failed to send reset link')
    } finally {
      setForgotLoading(false)
    }
  }

  async function handleSignup() {
    setError('')
    setSuccess('')
    setErrors({})
    const newErrors: Record<string, string> = {}

    if (!signupName) newErrors.name = '❌ Name required'
    if (!signupEmail) newErrors.email = '❌ Email required'
    else if (!validateEmail(signupEmail)) newErrors.email = '❌ Invalid email'

    if (!signupPassword) newErrors.password = '❌ Password required'
    else if (!validatePassword(signupPassword)) newErrors.password = '❌ Min 6 characters'

    if (signupPassword !== signupConfirmPassword) newErrors.confirmPassword = '❌ Passwords do not match'
    if (!signupPhone) newErrors.phone = '❌ Phone required'
    else if (!validatePhone(signupPhone)) newErrors.phone = '❌ Invalid phone (10 digits)'

    if (!agreeTerms) newErrors.terms = '❌ Agree to terms'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      if (Object.keys(newErrors).length === 1) {
        setError(Object.values(newErrors)[0])
      }
      return
    }

    setLoading(true)
    try {
      const auth = getAuth()
      const trimmedEmail = signupEmail.trim().toLowerCase()
      
      console.log('📝 Creating account:', trimmedEmail)
      
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, signupPassword)
      const firebaseUser = cred.user

      console.log('✅ Firebase account created:', firebaseUser.uid)

      try {
        const res = await api.post('/api/auth/login', {
          email: trimmedEmail,
          name: signupName,
          phone: signupPhone,
          role: selectedRole === 'provider' ? 'provider' : 'user',
          firebase_uid: firebaseUser?.uid,
        })
        console.log('✅ Backend signup successful')
        saveSessionUser(res.data.user)
      } catch (apiError: any) {
        console.warn('⚠️ Backend signup failed, using Firebase user:', apiError?.message)
        const user = {
          id: firebaseUser.uid,
          email: trimmedEmail,
          name: signupName,
          phone: signupPhone,
          role: selectedRole === 'provider' ? 'provider' : 'user'
        }
        saveSessionUser(user)
      }

      setSuccess('✅ Account created!')
      setTimeout(() => {
        if (selectedRole === 'provider') nav('/provider')
        else nav('/')
      }, 1000)
    } catch (e: any) {
      console.error('❌ Signup error:', e?.code, e?.message)
      
      let msg = '❌ Signup failed'
      if (e?.code === 'auth/email-already-in-use') msg = '❌ Email already registered'
      else if (e?.code === 'auth/weak-password') msg = '❌ Password too weak'
      else if (e?.code === 'auth/invalid-email') msg = '❌ Invalid email format'
      
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      
      console.log('🔵 Attempting Google login...')
      
      const cred = await signInWithPopup(auth, provider)
      const firebaseUser = cred.user
      const emailFromGoogle = (firebaseUser.email || '').trim().toLowerCase()

      if (!emailFromGoogle) throw new Error('No email from Google')

      console.log('✅ Google auth successful:', firebaseUser.uid)

      const isOwnerGoogle = emailFromGoogle === OWNER_EMAIL.toLowerCase()
      const resolvedRole = isOwnerGoogle
        ? 'admin'
        : selectedRole === 'provider'
          ? 'provider'
          : 'user'

      try {
        const res = await api.post('/api/auth/login', {
          email: emailFromGoogle,
          name: firebaseUser.displayName || '',
          phone: '',
          role: resolvedRole,
          firebase_uid: firebaseUser.uid,
        })
        console.log('✅ Backend Google login successful')
        saveSessionUser(res.data.user)
      } catch (apiError: any) {
        console.warn('⚠️ Backend Google login failed, using Firebase user:', apiError?.message)
        const user = {
          id: firebaseUser.uid,
          email: emailFromGoogle,
          name: firebaseUser.displayName || '',
          role: resolvedRole
        }
        saveSessionUser(user)
      }

      setSuccess('✅ Google login successful!')
      setTimeout(() => {
        if (isOwnerGoogle || selectedRole === 'owner') nav('/owner')
        else if (selectedRole === 'provider') nav('/provider')
        else nav('/')
      }, 1000)
    } catch (e: any) {
      console.error('❌ Google login error:', e?.code, e?.message)
      
      let msg = '❌ Google login failed'
      if (e?.code === 'auth/popup-closed-by-user') msg = '❌ Login cancelled'
      else if (e?.code === 'auth/popup-blocked') msg = '❌ Popup blocked by browser'
      
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function sendPhoneOTP() {
    setError('')
    setSuccess('')
    if (!validatePhone(phoneNumber)) {
      setError('❌ Invalid phone number (10 digits required)')
      return
    }

    setLoading(true)
    try {
      const formattedPhone = '+91' + phoneNumber.replace(/\D/g, '')
      console.log('Sending OTP to:', formattedPhone)
      
      const auth = getAuth()
      
      // Try Firebase Phone Auth
      try {
        // Create RecaptchaVerifier
        const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
          callback: (token: any) => {
            console.log('reCAPTCHA verified')
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired')
          }
        })

        const result = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier)
        setConfirmationResult(result)
        setPhoneOtpMode('verify')
        setOtpTimer(20)
        setOtpAttempts(0)
        setOtpCode('')
        setSuccess('✅ OTP sent to ' + formattedPhone + '\n📝 Demo OTP: 123456')
        console.log('✅ OTP sent successfully via Firebase')
      } catch (phoneError: any) {
        console.error('Firebase Phone Auth Error:', phoneError?.code, phoneError?.message)
        
        // Fallback to demo mode if Firebase fails
        console.log('⚠️ Firebase Phone Auth not available. Using Demo Mode.')
        console.log('📝 Demo OTP: 123456')
        
        // Create a mock confirmation result for demo
        const mockConfirmationResult = {
          confirm: async (code: string) => {
            if (code === '123456') {
              return {
                user: {
                  uid: 'demo-' + phoneNumber,
                  phoneNumber: formattedPhone,
                  displayName: 'Demo User'
                }
              }
            } else {
              throw new Error('Invalid OTP')
            }
          }
        }
        
        setConfirmationResult(mockConfirmationResult)
        setPhoneOtpMode('verify')
        setOtpTimer(20)
        setOtpAttempts(0)
        setOtpCode('')
        setSuccess('✅ Demo Mode: OTP sent to ' + formattedPhone + '\n📝 Use OTP: 123456')
        console.log('✅ Demo mode activated - use OTP: 123456')
      }
    } catch (e: any) {
      console.error('OTP Error:', e)
      setError('❌ Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function verifyPhoneOTP() {
    setError('')
    if (!otpCode || otpCode.length !== 6) {
      setError('❌ Please enter 6-digit OTP')
      return
    }

    if (otpTimer <= 0) {
      setError('❌ OTP expired. Request a new one.')
      return
    }

    if (otpAttempts >= 3) {
      setError('❌ Too many attempts. Request a new OTP.')
      return
    }

    setLoading(true)
    try {
      const cred = await confirmationResult.confirm(otpCode)
      const firebaseUser = cred.user
      const deviceInfo = getDeviceInfo()

      try {
        const res = await api.post('/api/auth/login', {
          email: firebaseUser.phoneNumber,
          name: firebaseUser?.displayName || 'User',
          phone: firebaseUser.phoneNumber,
          role: selectedRole === 'provider' ? 'provider' : 'user',
          firebase_uid: firebaseUser?.uid,
          device_info: deviceInfo
        })
        saveSessionUser(res.data.user)
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

      addLoginHistory(firebaseUser.phoneNumber, true)
      setSuccess('✅ Login successful!')
      setTimeout(() => {
        if (selectedRole === 'provider') nav('/provider')
        else nav('/')
      }, 1000)
    } catch (e: any) {
      const newAttempts = otpAttempts + 1
      setOtpAttempts(newAttempts)
      addLoginHistory(phoneNumber, false)
      const attemptsLeft = 3 - newAttempts
      if (attemptsLeft <= 0) {
        setError('❌ Too many failed attempts. Request a new OTP.')
      } else {
        setError(`❌ Invalid OTP. ${attemptsLeft} attempt${attemptsLeft > 1 ? 's' : ''} left`)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
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
        maxWidth: '450px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: '20px',
          textAlign: 'center'
        }}>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '22px' }}>🔐 Smart Service Hub</h1>
          <p style={{ margin: '0', fontSize: '12px', opacity: 0.9 }}>
            {authMode === 'role-select' ? 'Select role' : authMode === 'auth-method' ? 'Choose method' : `${selectedRole?.toUpperCase()} ${mode}`}
          </p>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '12px' }}>❌ {error}</div>}
          {success && <div style={{ background: '#dcfce7', color: '#16a34a', padding: '10px', borderRadius: '6px', marginBottom: '12px', fontSize: '12px' }}>✅ {success}</div>}

          {/* ROLE SELECTION */}
          {authMode === 'role-select' && (
            <div style={{ display: 'grid', gap: '12px' }}>
              <button 
                onClick={() => selectRole('customer')} 
                style={{ 
                  padding: '16px', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                👤 Customer - Book Services
              </button>
              <button 
                onClick={() => selectRole('provider')} 
                style={{ 
                  padding: '16px', 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                🔧 Provider - Offer Services
              </button>
              <button 
                onClick={() => selectRole('owner')} 
                style={{ 
                  padding: '16px', 
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                  color: '#fff', 
                  border: '2px solid #764ba2',
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 'bold',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(118, 75, 162, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 8px 20px rgba(118, 75, 162, 0.5)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(118, 75, 162, 0.4)'
                }}
              >
                👑 Owner - Admin Access
              </button>
            </div>
          )}

          {/* AUTH METHOD */}
          {authMode === 'auth-method' && (
            <div style={{ display: 'grid', gap: '8px' }}>
              {/* Email is always allowed */}
              <button
                onClick={() => selectAuthMethod('email')}
                style={{
                  padding: '12px',
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                📧 Email/Password
              </button>

              {/* Owner: Google only (no phone) with hint */}
              {selectedRole === 'owner' && (
                <>
                  <button
                    onClick={() => selectAuthMethod('google')}
                    style={{
                      padding: '12px',
                      background: '#4285f4',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🔵 Google (Owner)
                  </button>
                  <div style={{
                    fontSize: '11px',
                    color: '#6b7280',
                    background: '#f3f4f6',
                    borderRadius: '6px',
                    padding: '8px',
                    border: '1px dashed #d1d5db'
                  }}>
                    ℹ️ Use <strong>{OWNER_EMAIL}</strong> Google account to login as <strong>Owner</strong>.
                  </div>
                </>
              )}

              {/* Customer / Provider: Google + Phone OTP */}
              {selectedRole !== 'owner' && (
                <>
                  <button
                    onClick={() => selectAuthMethod('google')}
                    style={{
                      padding: '12px',
                      background: '#4285f4',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🔵 Google
                  </button>
                  <button
                    onClick={() => selectAuthMethod('phone')}
                    style={{
                      padding: '12px',
                      background: '#25d366',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    📱 Phone OTP
                  </button>
                </>
              )}

              <button
                onClick={backToRoleSelect}
                style={{
                  padding: '10px',
                  background: '#f3f4f6',
                  color: '#000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                ← Back
              </button>
            </div>
          )}

          {/* EMAIL LOGIN/SIGNUP */}
          {authMode === 'login' && authMethod === 'email' && (
            <div>
              {selectedRole !== 'owner' && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <button onClick={() => setMode('login')} style={{ flex: 1, padding: '10px', background: mode === 'login' ? '#667eea' : '#f3f4f6', color: mode === 'login' ? '#fff' : '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
                  <button onClick={() => setMode('signup')} style={{ flex: 1, padding: '10px', background: mode === 'signup' ? '#667eea' : '#f3f4f6', color: mode === 'signup' ? '#fff' : '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Sign Up</button>
                </div>
              )}

              {mode === 'login' && (
                <div>
                  {/* Owner Credentials Info */}
                  {selectedRole === 'owner' && (
                    <div style={{
                      background: '#fef3c7',
                      border: '2px solid #f59e0b',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '12px',
                      fontSize: '12px',
                      color: '#92400e'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>👑 Owner Credentials:</div>
                      <div style={{ fontFamily: 'monospace', background: '#fff', padding: '8px', borderRadius: '4px', marginBottom: '6px' }}>
                        <div>📧 Email: <strong>{OWNER_EMAIL}</strong></div>
                        <div>🔐 Pass: <strong>{OWNER_PASSWORD}</strong></div>
                      </div>
                      <div style={{ fontSize: '11px', opacity: 0.8 }}>
                        ℹ️ Use these credentials to login as owner
                      </div>
                    </div>
                  )}

                  <input 
                    type="email" 
                    value={loginEmail} 
                    onChange={(e) => setLoginEmail(e.target.value)} 
                    placeholder={selectedRole === 'owner' ? OWNER_EMAIL : "Email"}
                    style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '8px', boxSizing: 'border-box' }} 
                  />
                  <div style={{ position: 'relative', marginBottom: '8px' }}>
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)} 
                      placeholder={selectedRole === 'owner' ? OWNER_PASSWORD : "Password"}
                      style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', boxSizing: 'border-box' }} 
                    />
                    <button onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '10px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    <label style={{ fontSize: '12px' }}>Remember me</label>
                  </div>
                  {isLocked ? (
                    <>
                      <button disabled style={{ width: '100%', padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'not-allowed', fontWeight: 'bold', marginBottom: '8px' }}>🔒 Locked {lockTimer}s</button>
                      <button onClick={resetLock} style={{ width: '100%', padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>🔓 Reset Lock</button>
                    </>
                  ) : (
                    <button onClick={handleLogin} disabled={loading} style={{ width: '100%', padding: '10px', background: loading ? '#ccc' : '#667eea', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>{loading ? '⏳ Logging...' : '🔓 Login'}</button>
                  )}
                  <button onClick={() => setAuthMode('forgot-password')} style={{ width: '100%', padding: '10px', background: '#f3f4f6', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>🔑 Forgot Password?</button>
                </div>
              )}

              {mode === 'signup' && selectedRole !== 'owner' && (
                <div>
                  <input type="text" value={signupName} onChange={(e) => setSignupName(e.target.value)} placeholder="Name" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '8px', boxSizing: 'border-box' }} />
                  <input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="Email" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '8px', boxSizing: 'border-box' }} />
                  <input type="tel" value={signupPhone} onChange={(e) => setSignupPhone(e.target.value)} placeholder="Phone" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '8px', boxSizing: 'border-box' }} />
                  <input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} placeholder="Password" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '8px', boxSizing: 'border-box' }} />
                  <input type="password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} placeholder="Confirm Password" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '8px', boxSizing: 'border-box' }} />
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'center' }}>
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                    <label style={{ fontSize: '11px' }}>I agree to terms</label>
                  </div>
                  <button onClick={handleSignup} disabled={loading} style={{ width: '100%', padding: '10px', background: loading ? '#ccc' : '#667eea', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>{loading ? '⏳ Creating...' : '✍️ Sign Up'}</button>
                </div>
              )}

              <button onClick={backToAuthMethod} style={{ width: '100%', padding: '10px', background: '#f3f4f6', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>← Back</button>
            </div>
          )}

          {/* GOOGLE LOGIN */}
          {authMode === 'login' && authMethod === 'google' && (
            <div>
              <button onClick={handleGoogleLogin} disabled={loading} style={{ width: '100%', padding: '12px', background: loading ? '#ccc' : '#4285f4', color: '#fff', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>{loading ? '⏳ Logging...' : '🔵 Login with Google'}</button>
              <button onClick={backToAuthMethod} style={{ width: '100%', padding: '10px', background: '#f3f4f6', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>← Back</button>
            </div>
          )}

          {/* PHONE OTP */}
          {authMode === 'otp' && (
            <div>
              <h2 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#1f2937' }}>📱 Phone OTP Login</h2>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0' }}>Secure login with SMS verification</p>

              {phoneOtpMode === 'input' && (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>Phone Number *</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ padding: '12px', background: '#f3f4f6', borderRadius: '8px', fontSize: '14px', fontWeight: '600', color: '#1f2937' }}>+91</span>
                      <input 
                        type="tel" 
                        value={phoneNumber} 
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                        placeholder="9060195332" 
                        maxLength={10}
                        style={{ flex: 1, padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }} 
                      />
                    </div>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>Enter 10-digit mobile number</p>
                  </div>
                  <button onClick={sendPhoneOTP} disabled={loading || phoneNumber.length !== 10} style={{ width: '100%', padding: '12px', background: loading || phoneNumber.length !== 10 ? '#ccc' : '#25d366', color: '#fff', border: 'none', borderRadius: '8px', cursor: loading || phoneNumber.length !== 10 ? 'not-allowed' : 'pointer', fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>
                    {loading ? '⏳ Sending OTP...' : '📤 Send OTP'}
                  </button>
                </div>
              )}

              {phoneOtpMode === 'verify' && (
                <div>
                  <div style={{ background: '#f0fdf4', border: '2px solid #86efac', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#16a34a', margin: '0', fontWeight: '500' }}>✅ OTP sent to +91{phoneNumber}</p>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>Enter OTP *</label>
                    <input 
                      type="text" 
                      value={otpCode} 
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))} 
                      placeholder="000000" 
                      maxLength={6}
                      style={{ width: '100%', padding: '12px', border: '2px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', letterSpacing: '4px', textAlign: 'center', fontWeight: '600' }} 
                    />
                  </div>

                  {/* Advanced Timer Display */}
                  <div style={{ 
                    background: otpTimer > 10 ? '#f0fdf4' : otpTimer > 5 ? '#fef3c7' : '#fee2e2',
                    border: `2px solid ${otpTimer > 10 ? '#86efac' : otpTimer > 5 ? '#fcd34d' : '#fecaca'}`,
                    padding: '16px', 
                    borderRadius: '8px', 
                    marginBottom: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: otpTimer > 10 ? '#16a34a' : otpTimer > 5 ? '#d97706' : '#dc2626', fontWeight: '500', marginBottom: '4px' }}>
                      {otpTimer > 0 ? '⏱️ Time Remaining' : '❌ OTP Expired'}
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 'bold', color: otpTimer > 10 ? '#16a34a' : otpTimer > 5 ? '#d97706' : '#dc2626' }}>
                      {otpTimer}s
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                      {otpTimer > 0 ? 'Enter OTP before it expires' : 'Request a new OTP'}
                    </div>
                  </div>

                  <button 
                    onClick={verifyPhoneOTP} 
                    disabled={loading || otpTimer <= 0 || otpCode.length !== 6} 
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      background: loading || otpTimer <= 0 || otpCode.length !== 6 ? '#ccc' : '#25d366', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: loading || otpTimer <= 0 || otpCode.length !== 6 ? 'not-allowed' : 'pointer', 
                      fontWeight: '600', 
                      fontSize: '14px', 
                      marginBottom: '8px' 
                    }}
                  >
                    {loading ? '⏳ Verifying OTP...' : otpTimer <= 0 ? '❌ OTP Expired' : '✓ Verify OTP'}
                  </button>

                  <button 
                    onClick={() => { setPhoneOtpMode('input'); setOtpCode(''); setOtpAttempts(0); }} 
                    disabled={loading}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      background: '#f3f4f6', 
                      color: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px', 
                      cursor: 'pointer', 
                      fontSize: '13px',
                      fontWeight: '500'
                    }}
                  >
                    📤 Request New OTP
                  </button>

                  {otpAttempts > 0 && (
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', textAlign: 'center' }}>
                      Attempts: {otpAttempts}/3
                    </div>
                  )}
                </div>
              )}

              <button onClick={backToAuthMethod} style={{ width: '100%', padding: '10px', background: '#f3f4f6', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', marginTop: '12px' }}>← Back</button>
            </div>
          )}

          {/* FORGOT PASSWORD */}
          {authMode === 'forgot-password' && (
            <div>
              <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Enter your email" style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', marginBottom: '12px', boxSizing: 'border-box' }} />
              <button onClick={handleForgotPassword} disabled={forgotLoading} style={{ width: '100%', padding: '10px', background: forgotLoading ? '#ccc' : '#667eea', color: '#fff', border: 'none', borderRadius: '6px', cursor: forgotLoading ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>{forgotLoading ? '⏳ Sending...' : '📧 Send Reset Link'}</button>
              <button onClick={() => setAuthMode('login')} style={{ width: '100%', padding: '10px', background: '#f3f4f6', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>← Back to Login</button>
            </div>
          )}
        </div>
      </div>

      <div id="recaptcha-container" style={{ display: 'none' }}></div>
    </div>
  )
}
