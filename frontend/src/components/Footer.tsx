import { Link } from 'react-router-dom'
import { THEME, COLORS, SPACING, RADIUS, SHADOWS, TRANSITIONS } from '@/styles/theme'
import { useTheme } from '@/context/ThemeContext'

export default function Footer() {
  const { isDark } = useTheme()
  const theme = isDark ? THEME.dark : THEME.light

  const linkStyle = {
    color: theme.text.tertiary,
    textDecoration: 'none',
    fontSize: '13px',
    transition: TRANSITIONS.base,
    padding: `${SPACING.sm} 0`,
    display: 'block',
    cursor: 'pointer'
  }

  return (
    <footer style={{
      background: theme.bg.secondary,
      borderTop: `2px solid ${COLORS.gradient.split(',')[0]}`,
      color: theme.text.primary,
      width: '100%',
      boxSizing: 'border-box',
      marginTop: 'auto'
    }}>
      {/* Main Footer Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: `${SPACING.xxl} ${SPACING.lg}`,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: SPACING.xxl
      }}>
        {/* Brand Section */}
        <div>
          <h3 style={{
            margin: `0 0 ${SPACING.lg} 0`,
            fontSize: '20px',
            fontWeight: 'bold',
            background: COLORS.gradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🏢 Smart Service Hub
          </h3>
          <p style={{
            margin: `0 0 ${SPACING.md} 0`,
            fontSize: '13px',
            color: theme.text.tertiary,
            lineHeight: '1.6'
          }}>
            Book trusted local services from verified professionals with transparent pricing and 24/7 support.
          </p>
          <div style={{ display: 'flex', gap: SPACING.md, marginTop: SPACING.lg }}>
            <a 
              href="https://facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                fontSize: '20px', 
                cursor: 'pointer', 
                transition: TRANSITIONS.base,
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(102, 126, 234, 0.1)',
                border: `1px solid ${COLORS.primary}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7'
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
              }}
              title="Facebook"
            >
              f
            </a>
            <a 
              href="https://twitter.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                fontSize: '16px', 
                cursor: 'pointer', 
                transition: TRANSITIONS.base,
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(102, 126, 234, 0.1)',
                border: `1px solid ${COLORS.primary}`,
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7'
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
              }}
              title="Twitter"
            >
              𝕏
            </a>
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                fontSize: '18px', 
                cursor: 'pointer', 
                transition: TRANSITIONS.base,
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(102, 126, 234, 0.1)',
                border: `1px solid ${COLORS.primary}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7'
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
              }}
              title="Instagram"
            >
              📷
            </a>
            <a 
              href="https://linkedin.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{ 
                fontSize: '18px', 
                cursor: 'pointer', 
                transition: TRANSITIONS.base,
                opacity: 0.7,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(102, 126, 234, 0.1)',
                border: `1px solid ${COLORS.primary}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1'
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '0.7'
                e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'
              }}
              title="LinkedIn"
            >
              in
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 style={{
            margin: `0 0 ${SPACING.lg} 0`,
            fontSize: '16px',
            fontWeight: 'bold',
            color: theme.text.primary,
            paddingBottom: SPACING.md,
            borderBottom: `2px solid ${COLORS.primary}`
          }}>
            🔗 Quick Links
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.sm }}>
            <Link to="/" style={linkStyle as any}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.tertiary)}
            >
              → Home
            </Link>
            <Link to="/search" style={linkStyle as any}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.tertiary)}
            >
              → Search Services
            </Link>
            <Link to="/bookings" style={linkStyle as any}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.tertiary)}
            >
              → My Bookings
            </Link>
            <Link to="/profile" style={linkStyle as any}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.tertiary)}
            >
              → My Profile
            </Link>
          </div>
        </div>

        {/* Support & Legal */}
        <div>
          <h4 style={{
            margin: `0 0 ${SPACING.lg} 0`,
            fontSize: '16px',
            fontWeight: 'bold',
            color: theme.text.primary,
            paddingBottom: SPACING.md,
            borderBottom: `2px solid ${COLORS.primary}`
          }}>
            📋 Support & Legal
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.sm }}>
            <Link to="/contact" style={linkStyle as any}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.tertiary)}
            >
              → Contact Us
            </Link>
            <Link to="/terms" style={linkStyle as any}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.tertiary)}
            >
              → Terms & Conditions
            </Link>
            <Link to="/privacy" style={linkStyle as any}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.tertiary)}
            >
              → Privacy Policy
            </Link>
            <a href="mailto:support@smartservicehub.com" style={linkStyle as any}
              onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.primary)}
              onMouseLeave={(e) => (e.currentTarget.style.color = theme.text.tertiary)}
            >
              → Report Issue
            </a>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 style={{
            margin: `0 0 ${SPACING.lg} 0`,
            fontSize: '16px',
            fontWeight: 'bold',
            color: theme.text.primary,
            paddingBottom: SPACING.md,
            borderBottom: `2px solid ${COLORS.primary}`
          }}>
            📞 Contact Info
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.lg }}>
            <div style={{ display: 'flex', gap: SPACING.md, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>📧</span>
              <div>
                <div style={{ fontSize: '12px', color: theme.text.tertiary }}>Email</div>
                <a href="mailto:support@smartservicehub.com" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                  support@smartservicehub.com
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: SPACING.md, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>📱</span>
              <div>
                <div style={{ fontSize: '12px', color: theme.text.tertiary }}>Phone</div>
                <a href="tel:+919999900000" style={{ color: COLORS.primary, textDecoration: 'none', fontWeight: 'bold', fontSize: '13px' }}>
                  +91-99999-00000
                </a>
              </div>
            </div>
            <div style={{ display: 'flex', gap: SPACING.md, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px' }}>🕐</span>
              <div>
                <div style={{ fontSize: '12px', color: theme.text.tertiary }}>Support</div>
                <div style={{ color: COLORS.success, fontWeight: 'bold', fontSize: '13px' }}>24/7 Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
        margin: `${SPACING.xl} 0`
      }} />

      {/* Bottom Section */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: `${SPACING.lg} ${SPACING.lg}`,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: SPACING.lg,
        alignItems: 'center'
      }}>
        {/* Copyright */}
        <div style={{
          textAlign: 'center',
          fontSize: '12px',
          color: theme.text.tertiary,
          gridColumn: 'span 1'
        }}>
          © {new Date().getFullYear()} Smart Service Hub. All rights reserved.
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          gap: SPACING.lg,
          justifyContent: 'center',
          fontSize: '12px',
          color: theme.text.tertiary,
          flexWrap: 'wrap'
        }}>
          <div>✅ 5000+ Services</div>
          <div>⭐ 4.8 Rating</div>
          <div>👥 50K+ Users</div>
        </div>

        {/* Payment Methods */}
        <div style={{
          display: 'flex',
          gap: SPACING.md,
          justifyContent: 'center',
          fontSize: '16px'
        }}>
          <span title="Credit Card">💳</span>
          <span title="UPI">🏦</span>
          <span title="Google Pay">🔵</span>
          <span title="PhonePe">📱</span>
          <span title="Amazon Pay">📦</span>
        </div>
      </div>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 640px) {
          footer {
            padding: 0;
          }
          
          footer > div:first-child {
            padding: ${SPACING.lg} ${SPACING.md} !important;
          }
          
          footer h3 {
            font-size: 18px !important;
          }
          
          footer h4 {
            font-size: 14px !important;
          }
          
          footer p {
            font-size: 12px !important;
          }
          
          footer a {
            font-size: 12px !important;
          }
        }

        @media (max-width: 480px) {
          footer {
            padding: 0;
          }
          
          footer > div {
            padding: ${SPACING.md} !important;
            gap: ${SPACING.md} !important;
          }
          
          footer h3 {
            font-size: 16px !important;
          }
          
          footer h4 {
            font-size: 13px !important;
          }
          
          footer p {
            font-size: 11px !important;
          }
          
          footer a {
            font-size: 11px !important;
          }
        }
      `}</style>
    </footer>
  )
}
