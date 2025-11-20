// Advanced Style Utilities
import { COLORS, SPACING, RADIUS, SHADOWS, TRANSITIONS, TYPOGRAPHY } from './theme';

// Button Styles
export const buttonStyles = {
  primary: {
    background: COLORS.gradient,
    color: '#fff',
    border: 'none',
    padding: `${SPACING.md} ${SPACING.lg}`,
    borderRadius: RADIUS.lg,
    cursor: 'pointer',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.base,
    transition: TRANSITIONS.base,
    boxShadow: SHADOWS.md,
    '&:hover': {
      boxShadow: SHADOWS.lg,
      transform: 'translateY(-2px)'
    },
    '&:active': {
      transform: 'translateY(0)'
    }
  },
  secondary: {
    background: 'transparent',
    color: COLORS.primary,
    border: `2px solid ${COLORS.primary}`,
    padding: `${SPACING.md} ${SPACING.lg}`,
    borderRadius: RADIUS.lg,
    cursor: 'pointer',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.base,
    transition: TRANSITIONS.base,
    '&:hover': {
      background: COLORS.primary,
      color: '#fff'
    }
  },
  success: {
    background: COLORS.success,
    color: '#fff',
    border: 'none',
    padding: `${SPACING.md} ${SPACING.lg}`,
    borderRadius: RADIUS.lg,
    cursor: 'pointer',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.base,
    transition: TRANSITIONS.base,
    boxShadow: SHADOWS.md,
    '&:hover': {
      boxShadow: SHADOWS.lg,
      opacity: 0.9
    }
  },
  danger: {
    background: COLORS.danger,
    color: '#fff',
    border: 'none',
    padding: `${SPACING.md} ${SPACING.lg}`,
    borderRadius: RADIUS.lg,
    cursor: 'pointer',
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    fontSize: TYPOGRAPHY.fontSize.base,
    transition: TRANSITIONS.base,
    boxShadow: SHADOWS.md,
    '&:hover': {
      boxShadow: SHADOWS.lg,
      opacity: 0.9
    }
  }
};

// Card Styles
export const cardStyles = {
  default: {
    background: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    boxShadow: SHADOWS.md,
    border: '1px solid #e5e7eb',
    transition: TRANSITIONS.base,
    '&:hover': {
      boxShadow: SHADOWS.lg,
      transform: 'translateY(-4px)'
    }
  },
  elevated: {
    background: '#fff',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    boxShadow: SHADOWS.xl,
    border: 'none',
    transition: TRANSITIONS.base
  },
  outlined: {
    background: 'transparent',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    border: `2px solid ${COLORS.primary}`,
    transition: TRANSITIONS.base,
    '&:hover': {
      background: `${COLORS.primary}10`
    }
  },
  gradient: {
    background: COLORS.gradient,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    color: '#fff',
    boxShadow: SHADOWS.lg,
    transition: TRANSITIONS.base
  }
};

// Input Styles
export const inputStyles = {
  default: {
    width: '100%',
    padding: `${SPACING.md} ${SPACING.lg}`,
    borderRadius: RADIUS.md,
    border: `1px solid #e5e7eb`,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.base,
    transition: TRANSITIONS.base,
    '&:focus': {
      outline: 'none',
      borderColor: COLORS.primary,
      boxShadow: `0 0 0 3px ${COLORS.primary}20`
    },
    '&:disabled': {
      background: '#f3f4f6',
      cursor: 'not-allowed',
      opacity: 0.6
    }
  },
  error: {
    width: '100%',
    padding: `${SPACING.md} ${SPACING.lg}`,
    borderRadius: RADIUS.md,
    border: `2px solid ${COLORS.danger}`,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.base,
    transition: TRANSITIONS.base,
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${COLORS.danger}20`
    }
  },
  success: {
    width: '100%',
    padding: `${SPACING.md} ${SPACING.lg}`,
    borderRadius: RADIUS.md,
    border: `2px solid ${COLORS.success}`,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontFamily: TYPOGRAPHY.fontFamily.base,
    transition: TRANSITIONS.base,
    '&:focus': {
      outline: 'none',
      boxShadow: `0 0 0 3px ${COLORS.success}20`
    }
  }
};

// Badge Styles
export const badgeStyles = {
  primary: {
    background: COLORS.primary,
    color: '#fff',
    padding: `${SPACING.xs} ${SPACING.md}`,
    borderRadius: RADIUS.full,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    display: 'inline-block'
  },
  success: {
    background: COLORS.success,
    color: '#fff',
    padding: `${SPACING.xs} ${SPACING.md}`,
    borderRadius: RADIUS.full,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    display: 'inline-block'
  },
  warning: {
    background: COLORS.warning,
    color: '#fff',
    padding: `${SPACING.xs} ${SPACING.md}`,
    borderRadius: RADIUS.full,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    display: 'inline-block'
  },
  danger: {
    background: COLORS.danger,
    color: '#fff',
    padding: `${SPACING.xs} ${SPACING.md}`,
    borderRadius: RADIUS.full,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    display: 'inline-block'
  }
};

// Alert Styles
export const alertStyles = {
  success: {
    background: `${COLORS.success}15`,
    borderLeft: `4px solid ${COLORS.success}`,
    color: COLORS.success,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize.base
  },
  error: {
    background: `${COLORS.danger}15`,
    borderLeft: `4px solid ${COLORS.danger}`,
    color: COLORS.danger,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize.base
  },
  warning: {
    background: `${COLORS.warning}15`,
    borderLeft: `4px solid ${COLORS.warning}`,
    color: COLORS.warning,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize.base
  },
  info: {
    background: `${COLORS.info}15`,
    borderLeft: `4px solid ${COLORS.info}`,
    color: COLORS.info,
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    fontSize: TYPOGRAPHY.fontSize.base
  }
};

// Flex Utilities
export const flexStyles = {
  center: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  between: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  around: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  column: {
    display: 'flex',
    flexDirection: 'column'
  },
  columnCenter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
  }
};

// Grid Utilities
export const gridStyles = {
  twoColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: SPACING.lg
  },
  threeColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: SPACING.lg
  },
  fourColumn: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: SPACING.lg
  },
  autoFit: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: SPACING.lg
  }
};

// Text Utilities
export const textStyles = {
  heading1: {
    fontSize: TYPOGRAPHY.fontSize.huge,
    fontWeight: TYPOGRAPHY.fontWeight.extrabold,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
    fontFamily: TYPOGRAPHY.fontFamily.base
  },
  heading2: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
    fontFamily: TYPOGRAPHY.fontFamily.base
  },
  heading3: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
    fontFamily: TYPOGRAPHY.fontFamily.base
  },
  body: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    fontFamily: TYPOGRAPHY.fontFamily.base
  },
  small: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
    fontFamily: TYPOGRAPHY.fontFamily.base
  },
  caption: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
    fontFamily: TYPOGRAPHY.fontFamily.base,
    color: '#6b7280'
  }
};

// Animation Utilities
export const animationStyles = {
  fadeIn: {
    animation: 'fadeIn 0.3s ease-in'
  },
  slideUp: {
    animation: 'slideUp 0.3s ease-out'
  },
  slideDown: {
    animation: 'slideDown 0.3s ease-out'
  },
  pulse: {
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
  },
  spin: {
    animation: 'spin 1s linear infinite'
  }
};

// Responsive Utilities
export const responsiveStyles = {
  mobileOnly: {
    '@media (min-width: 768px)': {
      display: 'none'
    }
  },
  tabletUp: {
    '@media (max-width: 767px)': {
      display: 'none'
    }
  },
  desktopOnly: {
    '@media (max-width: 1023px)': {
      display: 'none'
    }
  }
};

// Helper function to merge styles
export const mergeStyles = (...styles: any[]): any => {
  return Object.assign({}, ...styles);
};

// Helper function to create responsive styles
export const createResponsiveStyle = (mobile: any, tablet: any, desktop: any): any => {
  return {
    ...mobile,
    '@media (min-width: 768px)': tablet,
    '@media (min-width: 1024px)': desktop
  };
};
