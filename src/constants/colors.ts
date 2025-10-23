/**
 * Medical Design System - Color Palette
 */

export const Colors = {
  // Medical Blue (Primary)
  primary: {
    DEFAULT: '#0D7FFF',
    light: '#B3D9FF',
    dark: '#0356B3',
    foreground: '#FFFFFF',
  },

  // Health Green (Secondary)
  health: {
    DEFAULT: '#13C57B',
    light: '#C2F5E0',
  },

  secondary: {
    DEFAULT: '#F0F9F5',
    foreground: '#234D3A',
  },

  // Alert Colors
  destructive: {
    DEFAULT: '#ED3939',
    foreground: '#FFFFFF',
  },

  warning: {
    DEFAULT: '#F5A623',
    foreground: '#1A1300',
  },

  // Neutral Colors (Light Mode)
  background: '#F8FAFB',
  foreground: '#1F2937',

  muted: {
    DEFAULT: '#F3F5F7',
    foreground: '#3E4C59',
  },

  border: '#D9DFE5',

  // Dark Mode Colors
  darkMode: {
    background: '#171D2A',
    foreground: '#F1F3F5',
    muted: {
      DEFAULT: '#232B3D',
      foreground: '#B4BCC9',
    },
    border: '#303847',
    card: '#1E2433',
  },

  // Gradients (for LinearGradient)
  gradients: {
    primary: ['#0D7FFF', '#0356B3'],
    health: ['#13C57B', '#C2F5E0'],
    medicalLogo: ['#13C57B', '#0D7FFF'],
  },
} as const;

export const ColorsHSL = {
  primary: {
    DEFAULT: 'hsl(210, 95%, 51%)',
    light: 'hsl(210, 95%, 85%)',
    dark: 'hsl(210, 95%, 35%)',
    foreground: 'hsl(0, 0%, 100%)',
  },
  health: {
    DEFAULT: 'hsl(145, 85%, 47%)',
    light: 'hsl(145, 85%, 90%)',
  },
  secondary: {
    DEFAULT: 'hsl(150, 45%, 96%)',
    foreground: 'hsl(150, 45%, 25%)',
  },
  destructive: {
    DEFAULT: 'hsl(0, 84%, 60%)',
    foreground: 'hsl(0, 0%, 100%)',
  },
  warning: {
    DEFAULT: 'hsl(45, 93%, 47%)',
    foreground: 'hsl(45, 93%, 10%)',
  },
  background: 'hsl(210, 30%, 98%)',
  foreground: 'hsl(215, 25%, 16%)',
  muted: {
    DEFAULT: 'hsl(210, 20%, 96%)',
    foreground: 'hsl(215, 20%, 30%)',
  },
  border: 'hsl(215, 20%, 88%)',
} as const;

export type ColorName = keyof typeof Colors;
