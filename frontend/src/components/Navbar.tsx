import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getSessionUser, clearSessionUser } from '@/auth'
import { COLORS, SPACING, RADIUS, SHADOWS, TRANSITIONS } from '@/styles/theme'
import { useTheme } from '@/context/ThemeContext'

export default function Navbar() {
  const nav = useNavigate()
  const loc = useLocation()
  const user = getSessionUser()
  const { isDark, setIsDark } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const OWNER_EMAIL = 'supermanverma@gmail.com'
  const isOwner = user?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()
  const isProvider = user?.role === 'provider'
  const isCustomer = user?.role === 'user' || user?.role === 'customer'

  // Build navigation items based on role
  const getNavItems = () => {
    if (!user) return []

    const baseItems = [
      { label: '🏠 Home', path: '/' },
      { label: '🔍 Search', path: '/search' },
      { label: '📅 My Bookings', path: '/bookings' },
      { label: '👤 Profile', path: '/profile' },
    ]

    // Owner gets EVERYTHING
    if (isOwner) {
      return [
        ...baseItems,
        { label: '🔧 Provider', path: '/provider' },
        { label: '⚙️ Admin Panel', path: '/admin' },
        { label: '👑 Owner Center', path: '/owner' },
      ]
    }

    // Provider-specific items (but not owner)
    if (user?.role === 'provider') {
      return [
        ...baseItems,
        { label: '🔧 Provider Dashboard', path: '/provider' },
      ]
    }

    // Regular customer/user
    return baseItems
  }

  const navItems = getNavItems()

  const handleLogout = () => {
    clearSessionUser()
    nav('/login')
  }

  return (
    <nav style={{
      background: COLORS.gradient,
      color: '#fff',
      padding: `${SPACING.md} ${SPACING.lg}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: SHADOWS.lg,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      width: '100%',
      boxSizing: 'border-box',
      margin: 0,
      marginBottom: 0
    }}>
      {/* Logo */}
      <div 
        onClick={() => nav('/')}
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: SPACING.md,
          transition: TRANSITIONS.base
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        🏢 Smart Service Hub
      </div>

      {/* Desktop Navigation */}
      <div style={{
        display: 'flex',
        gap: SPACING.lg,
        alignItems: 'center'
      }} className="desktop-nav">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => nav(item.path)}
            style={{
              background: loc.pathname === item.path ? 'rgba(255,255,255,0.3)' : 'transparent',
              color: '#fff',
              border: 'none',
              padding: `${SPACING.sm} ${SPACING.md}`,
              borderRadius: RADIUS.md,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              transition: TRANSITIONS.base
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = loc.pathname === item.path ? 'rgba(255,255,255,0.3)' : 'transparent')}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Right Section */}
      <div style={{
        display: 'flex',
        gap: SPACING.md,
        alignItems: 'center'
      }}>
        {/* Role Badge with Advanced Features */}
        {user && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                padding: `${SPACING.sm} ${SPACING.md}`,
                background: isOwner ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' : isProvider ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
                borderRadius: RADIUS.lg,
                fontSize: '12px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                transition: TRANSITIONS.base,
                boxShadow: SHADOWS.md,
                display: 'flex',
                alignItems: 'center',
                gap: SPACING.sm
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
                e.currentTarget.style.boxShadow = SHADOWS.lg
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
                e.currentTarget.style.boxShadow = SHADOWS.md
              }}
            >
              {isOwner ? '👑 Owner' : isProvider ? '🔧 Provider' : '👤 Customer'}
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: '#fff',
                border: `2px solid ${COLORS.primary}`,
                borderRadius: RADIUS.lg,
                boxShadow: SHADOWS.xl,
                zIndex: 1001,
                minWidth: '200px',
                marginTop: SPACING.sm,
                overflow: 'hidden'
              }}>
                {/* User Info */}
                <div style={{
                  padding: SPACING.md,
                  borderBottom: `1px solid #e5e7eb`,
                  background: '#f9fafb'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937' }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                    {user?.email}
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    nav('/profile')
                    setShowUserMenu(false)
                  }}
                  style={{
                    width: '100%',
                    padding: SPACING.md,
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#1f2937',
                    fontWeight: '500',
                    transition: TRANSITIONS.fast,
                    borderBottom: `1px solid #e5e7eb`
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  👤 My Profile
                </button>

                {isProvider && (
                  <button
                    onClick={() => {
                      nav('/provider')
                      setShowUserMenu(false)
                    }}
                    style={{
                      width: '100%',
                      padding: SPACING.md,
                      background: 'transparent',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: '#1f2937',
                      fontWeight: '500',
                      transition: TRANSITIONS.fast,
                      borderBottom: `1px solid #e5e7eb`
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    🔧 Provider Dashboard
                  </button>
                )}

                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        nav('/admin')
                        setShowUserMenu(false)
                      }}
                      style={{
                        width: '100%',
                        padding: SPACING.md,
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#1f2937',
                        fontWeight: '500',
                        transition: TRANSITIONS.fast,
                        borderBottom: `1px solid #e5e7eb`
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      ⚙️ Admin Panel
                    </button>
                    <button
                      onClick={() => {
                        nav('/owner')
                        setShowUserMenu(false)
                      }}
                      style={{
                        width: '100%',
                        padding: SPACING.md,
                        background: 'transparent',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontSize: '13px',
                        color: '#1f2937',
                        fontWeight: '500',
                        transition: TRANSITIONS.fast,
                        borderBottom: `1px solid #e5e7eb`
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      👑 Owner Center
                    </button>
                  </>
                )}

                {/* Logout */}
                <button
                  onClick={() => {
                    clearSessionUser()
                    nav('/login')
                    setShowUserMenu(false)
                  }}
                  style={{
                    width: '100%',
                    padding: SPACING.md,
                    background: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#dc2626',
                    fontWeight: '600',
                    transition: TRANSITIONS.fast
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#fee2e2')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          style={{
            padding: `${SPACING.sm} ${SPACING.md}`,
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: 'none',
            borderRadius: RADIUS.md,
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '13px',
            transition: TRANSITIONS.base
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.3)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        >
          {isDark ? '☀️ Light' : '🌙 Dark'}
        </button>

        {/* Login Button (when not logged in) */}
        {!user && (
          <button
            onClick={() => nav('/login')}
            style={{
              padding: `${SPACING.sm} ${SPACING.md}`,
              background: '#fff',
              color: COLORS.primary,
              border: 'none',
              borderRadius: RADIUS.md,
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              transition: TRANSITIONS.base,
              boxShadow: SHADOWS.md
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = SHADOWS.lg
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = SHADOWS.md
            }}
          >
            🔐 Login
          </button>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            padding: `${SPACING.sm} ${SPACING.md}`,
            background: 'rgba(255,255,255,0.2)',
            color: '#fff',
            border: 'none',
            borderRadius: RADIUS.md,
            cursor: 'pointer',
            fontSize: '18px'
          }}
          className="mobile-menu-btn"
        >
          ☰
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: COLORS.gradient,
          padding: SPACING.lg,
          display: 'flex',
          flexDirection: 'column',
          gap: SPACING.md,
          boxShadow: SHADOWS.lg
        }}>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => {
                nav(item.path)
                setMobileMenuOpen(false)
              }}
              style={{
                background: loc.pathname === item.path ? 'rgba(255,255,255,0.3)' : 'transparent',
                color: '#fff',
                border: 'none',
                padding: `${SPACING.md} ${SPACING.lg}`,
                borderRadius: RADIUS.md,
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                textAlign: 'left',
                transition: TRANSITIONS.base
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  )
}
