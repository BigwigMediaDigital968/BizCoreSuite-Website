/**
 * Bizcore Suite — Global Brand Theme Configuration
 * All design tokens are centralized here for easy theming and global updates.
 * Inspired by the BOL7 rhythm, transformed into a deep, premium Dark Blue SaaS aesthetic.
 */

export const brandTheme = {
  colors: {
    // Dark Navy spectrum (used for dark scenes, deep backgrounds, high-contrast text)
    navy: {
      950: '#050E2E', // Darkest background for Security and Final CTA
      900: '#0A1A4A', // Primary brand dark blue (Header, primary gradient start)
      850: '#0D215E',
      800: '#10286E', // Secondary dark blue
      700: '#15368E',
      text: '#0B1230', // Deep near-black navy for primary headlines
      muted: '#4A5578', // Slate navy for secondary text
    },
    // Vibrant Blue Accents (replaces BOL7 orange with electric SaaS blue)
    blue: {
      600: '#1D4ED8', // Primary accent / gradient end
      500: '#2563EB', // Hover states
      400: '#5B8CFF', // Glows, pills, floating chips
      300: '#93B5FF',
      200: '#C7D9FF',
      100: '#E0EBFF',
    },
    // Soft Tint Backgrounds (replaces BOL7 pink tint with crisp modern blue tint)
    tint: {
      50: '#F7F9FF',  // Main page canvas
      100: '#EEF3FF', // Subtle section backgrounds and card borders
      200: '#E4ECFD',
      300: '#D2DFFB',
    },
    // Accents & Functional
    functional: {
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',
    }
  },
  
  gradients: {
    primary: 'linear-gradient(135deg, #0A1A4A 0%, #1D4ED8 100%)',
    primaryHover: 'linear-gradient(135deg, #10286E 0%, #2563EB 100%)',
    pill: 'linear-gradient(135deg, rgba(238, 243, 255, 0.8) 0%, rgba(228, 236, 253, 0.4) 100%)',
    textHighlight: 'linear-gradient(135deg, #0A1A4A 15%, #1D4ED8 65%, #5B8CFF 100%)',
    darkNavy: 'linear-gradient(180deg, #0A1A4A 0%, #050E2E 100%)',
    radialHalo: 'radial-gradient(circle, rgba(91, 140, 255, 0.22) 0%, rgba(29, 78, 216, 0.05) 55%, transparent 75%)',
    cardBorder: 'linear-gradient(135deg, rgba(91, 140, 255, 0.3) 0%, rgba(29, 78, 216, 0.05) 100%)',
  },

  shadows: {
    card: '0 20px 60px rgba(29, 78, 216, 0.12)',
    cardHover: '0 25px 70px rgba(29, 78, 216, 0.22)',
    glow: '0 0 45px rgba(91, 140, 255, 0.35)',
    glowDark: '0 0 60px rgba(29, 78, 216, 0.45)',
    floatingPill: '0 12px 36px -4px rgba(10, 26, 74, 0.15)',
    button: '0 10px 25px -5px rgba(29, 78, 216, 0.4)',
  },

  borders: {
    card: '1px solid rgba(10, 26, 74, 0.08)',
    glass: '1px solid rgba(255, 255, 255, 0.65)',
    darkGlass: '1px solid rgba(255, 255, 255, 0.12)',
  },

  radii: {
    pill: '9999px',
    card: '1.25rem', // 20px
    cardLg: '1.75rem', // 28px
    badge: '0.75rem',
  },

  transitions: {
    easeExpo: 'cubic-bezier(0.16, 1, 0.3, 1)',
    easePower3: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    durationNormal: '0.35s',
    durationSlow: '0.8s',
  }
} as const;

export type BrandTheme = typeof brandTheme;

