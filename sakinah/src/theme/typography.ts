export const typography = {
  // Font families
  fontFamily: {
    // Arabic fonts
    arab: 'Cairo', // Will be loaded from Google Fonts
    arabSans: 'Poppins', // Fallback

    // English fonts
    sans: 'Poppins',
    serif: 'Playfair Display',
    mono: 'Courier New',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  fontWeight: {
    thin: '100' as const,
    extralight: '200' as const,
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: -1,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },

  // Predefined text styles
  styles: {
    h1: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.3,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    subtitle1: {
      fontSize: 16,
      fontWeight: '500' as const,
      lineHeight: 1.5,
      letterSpacing: 0.5,
    },
    subtitle2: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 1.5,
      letterSpacing: 0.5,
    },
    button: {
      fontSize: 14,
      fontWeight: '600' as const,
      lineHeight: 1.5,
      letterSpacing: 0.5,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.4,
      letterSpacing: 0.5,
    },
    overline: {
      fontSize: 11,
      fontWeight: '600' as const,
      lineHeight: 1.5,
      letterSpacing: 1.5,
      textTransform: 'uppercase' as const,
    },
  },
};

export type Typography = typeof typography;
