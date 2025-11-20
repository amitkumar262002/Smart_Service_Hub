// Advanced Professional Theme System
export const THEME = {
  dark: {
    bg: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      hover: '#475569',
      overlay: 'rgba(15, 23, 42, 0.95)',
      card: '#1e293b'
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
      muted: '#64748b'
    },
    border: '#334155',
    shadow: 'rgba(0, 0, 0, 0.3)',
    divider: 'rgba(255, 255, 255, 0.1)'
  },
  light: {
    bg: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      hover: '#e2e8f0',
      overlay: 'rgba(255, 255, 255, 0.95)',
      card: '#ffffff'
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
      tertiary: '#64748b',
      muted: '#94a3b8'
    },
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    divider: 'rgba(0, 0, 0, 0.05)'
  }
}

export const COLORS = {
  primary: '#667eea',
  primaryDark: '#764ba2',
  primaryLight: '#8b9eff',
  success: '#10b981',
  successLight: '#6ee7b7',
  warning: '#f59e0b',
  warningLight: '#fcd34d',
  danger: '#dc2626',
  dangerLight: '#fca5a5',
  info: '#3b82f6',
  infoLight: '#93c5fd',
  neutral: '#6b7280',
  gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradientReverse: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
  gradientSuccess: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)',
  gradientWarning: 'linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)',
  gradientDanger: 'linear-gradient(135deg, #dc2626 0%, #fca5a5 100%)'
}

export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  xxxl: '32px',
  huge: '40px'
}

export const RADIUS = {
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  xxl: '16px',
  full: '9999px'
}

export const SHADOWS = {
  xs: '0 1px 1px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  xxl: '0 25px 50px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  glow: '0 0 20px rgba(102, 126, 234, 0.3)',
  glowPrimary: '0 0 30px rgba(102, 126, 234, 0.4)'
}

export const TRANSITIONS = {
  xs: '0.1s ease',
  fast: '0.15s ease',
  base: '0.2s ease',
  slow: '0.3s ease',
  slower: '0.5s ease',
  slowest: '0.7s ease',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
}

export const TYPOGRAPHY = {
  fontFamily: {
    base: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"Fira Code", "Courier New", monospace'
  },
  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    xxl: '20px',
    xxxl: '24px',
    huge: '32px'
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2
  }
}

export const BREAKPOINTS = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  xxl: '1536px'
}

export const Z_INDEX = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  backdrop: 1040,
  offcanvas: 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
  notification: 9999
}
