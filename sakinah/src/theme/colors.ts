export const colors = {
  // Primary - Dark elegant with Islamic green
  primary: {
    dark: '#0a0e27',
    main: '#1a1f3a',
    light: '#2a2f4a',
  },

  // Accent - Islamic Green
  accent: {
    dark: '#1b5e3a',
    main: '#2d8b56',
    light: '#4db875',
    lighter: '#7ec896',
  },

  // Gold - Calm elegant gold
  gold: {
    dark: '#8b7a3d',
    main: '#c4a965',
    light: '#d4b896',
    lighter: '#e8d5b7',
  },

  // Neutral - Grayscale
  neutral: {
    0: '#000000',
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Semantic colors
  semantic: {
    text: {
      primary: '#ffffff',
      secondary: '#d1d5db',
      tertiary: '#9ca3af',
      disabled: '#6b7280',
    },
    background: {
      primary: '#0a0e27',
      secondary: '#1a1f3a',
      tertiary: '#2a2f4a',
    },
    border: {
      light: '#374151',
      main: '#4b5563',
      dark: '#6b7280',
    },
  },
};

export type ColorValue = typeof colors;
