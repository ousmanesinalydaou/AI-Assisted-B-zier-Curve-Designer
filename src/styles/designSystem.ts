// Modern Design System with Geometric AI Theme

export const designTokens = {
  // Color Palette - Geometric AI Theme
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    ai: {
      purple: '#8b5cf6',
      cyan: '#06b6d4',
      emerald: '#10b981',
      pink: '#ec4899',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      glow: 'rgba(139, 92, 246, 0.4)',
    },
    geometric: {
      grid: 'rgba(139, 92, 246, 0.1)',
      line: 'rgba(6, 182, 212, 0.3)',
      point: '#ec4899',
      curve: '#8b5cf6',
    },
    dark: {
      bg: '#0a0a0a',
      surface: '#1a1a1a',
      surfaceHover: '#252525',
      border: '#2a2a2a',
      text: '#e5e5e5',
      textSecondary: '#a3a3a3',
    },
    light: {
      bg: '#ffffff',
      surface: '#f9fafb',
      surfaceHover: '#f3f4f6',
      border: '#e5e7eb',
      text: '#1f2937',
      textSecondary: '#6b7280',
    },
  },

  // Spacing Scale
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem',  // 8px
    md: '1rem',    // 16px
    lg: '1.5rem',  // 24px
    xl: '2rem',    // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  // Border Radius
  radius: {
    sm: '0.375rem',  // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    glow: '0 0 20px rgba(139, 92, 246, 0.5)',
    glowCyan: '0 0 20px rgba(6, 182, 212, 0.5)',
    glowPink: '0 0 20px rgba(236, 72, 153, 0.5)',
  },

  // Typography
  fonts: {
    sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Fira Code", "JetBrains Mono", Consolas, monospace',
    display: '"Space Grotesk", sans-serif',
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    base: '1rem',    // 16px
    lg: '1.125rem',  // 18px
    xl: '1.25rem',   // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },

  // Animations
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Z-Index Scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Glassmorphism Effect
export const glassMorphism = (theme: 'light' | 'dark') => ({
  background: theme === 'dark' 
    ? 'rgba(26, 26, 26, 0.7)'
    : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
});

// Neumorphism Effect
export const neumorphism = (theme: 'light' | 'dark') => ({
  boxShadow: theme === 'dark'
    ? '8px 8px 16px rgba(0, 0, 0, 0.4), -8px -8px 16px rgba(40, 40, 40, 0.1)'
    : '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.8)',
  background: theme === 'dark' ? '#1a1a1a' : '#f0f0f0',
});

// Gradient Text
export const gradientText = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

// Geometric Patterns
export const geometricPatterns = {
  dots: (theme: 'light' | 'dark') => ({
    backgroundImage: `radial-gradient(${theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
  }),
  
  grid: (theme: 'light' | 'dark') => ({
    backgroundImage: `
      linear-gradient(${theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'} 1px, transparent 1px),
      linear-gradient(90deg, ${theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'} 1px, transparent 1px)
    `,
    backgroundSize: '50px 50px',
  }),
  
  hexagons: (theme: 'light' | 'dark') => ({
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' fill='none' stroke='${theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'}' stroke-width='1'/%3E%3C/svg%3E")`,
  }),
};

// Animated Gradient Background
export const animatedGradient = {
  background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #06b6d4)',
  backgroundSize: '400% 400%',
  animation: 'gradient 15s ease infinite',
};

export const gradientKeyframes = `
@keyframes gradient {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
`;

// Button Variants
export const buttonVariants = {
  primary: (theme: 'light' | 'dark') => ({
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#ffffff',
    boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.4)',
    transition: 'all 0.3s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px 0 rgba(139, 92, 246, 0.6)',
    },
  }),
  
  glass: (theme: 'light' | 'dark') => ({
    ...glassMorphism(theme),
    ':hover': {
      background: theme === 'dark' 
        ? 'rgba(26, 26, 26, 0.9)'
        : 'rgba(255, 255, 255, 0.9)',
    },
  }),
  
  ai: (theme: 'light' | 'dark') => ({
    background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
    color: '#ffffff',
    boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)',
    animation: 'pulse 2s ease-in-out infinite',
  }),
};

// Card Variants
export const cardVariants = {
  glass: (theme: 'light' | 'dark') => ({
    ...glassMorphism(theme),
    borderRadius: designTokens.radius.xl,
    padding: designTokens.spacing.lg,
  }),
  
  elevated: (theme: 'light' | 'dark') => ({
    background: theme === 'dark' ? designTokens.colors.dark.surface : designTokens.colors.light.surface,
    borderRadius: designTokens.radius.xl,
    boxShadow: designTokens.shadows.lg,
    border: `1px solid ${theme === 'dark' ? designTokens.colors.dark.border : designTokens.colors.light.border}`,
  }),
  
  ai: (theme: 'light' | 'dark') => ({
    background: theme === 'dark'
      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)'
      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
    borderRadius: designTokens.radius.xl,
    border: '1px solid rgba(139, 92, 246, 0.2)',
    boxShadow: '0 0 30px rgba(139, 92, 246, 0.2)',
  }),
};

export default designTokens;
