// Pastel Color Palette Configuration
export const colors = {
  // Primary pastel colors
  primary: {
    50: '#f0f4ff',  // Lightest lavender
    100: '#e5edff', // Very light lavender
    200: '#c3d9ff', // Light lavender
    300: '#a3c0ff', // Soft lavender
    400: '#7e9eff', // Medium lavender
    500: '#6b85e8', // Base lavender
    600: '#5a70d6', // Darker lavender
  },

  // Soft pastels for various uses
  pastel: {
    mint: '#b8e6d3',      // Soft mint green
    peach: '#ffd6cc',     // Soft peach
    sky: '#c3e7ff',       // Soft sky blue
    lavender: '#e5d4ff',  // Soft lavender
    rose: '#ffd4e5',      // Soft rose
    lemon: '#fff5d6',     // Soft lemon
    sage: '#d4e6d4',      // Soft sage green
    powder: '#e6d9ff',    // Soft powder purple
    coral: '#ffccb3',     // Soft coral
    pearl: '#f5f3f0',     // Soft pearl
  },

  // Semantic colors (pastels)
  success: {
    light: '#d1f4e0',  // Soft green
    DEFAULT: '#a8e6c1', // Medium soft green
    dark: '#7bc99c',   // Darker soft green
  },

  warning: {
    light: '#fff4e1',  // Soft amber
    DEFAULT: '#ffdd9e', // Medium soft amber
    dark: '#f4c67d',   // Darker soft amber
  },

  error: {
    light: '#ffe0e0',  // Soft red
    DEFAULT: '#ffb3b3', // Medium soft red
    dark: '#ff9999',   // Darker soft red
  },

  info: {
    light: '#e1f0ff',  // Soft blue
    DEFAULT: '#b3d9ff', // Medium soft blue
    dark: '#8ac4ff',   // Darker soft blue
  },

  // Neutral pastels
  gray: {
    50: '#fafaf9',   // Off white
    100: '#f5f5f4',  // Very light gray
    200: '#e7e5e4',  // Light gray
    300: '#d6d3d1',  // Soft gray
    400: '#a8a29e',  // Medium gray
    500: '#78716c',  // Gray
    600: '#57534e',  // Dark gray
    700: '#44403c',  // Darker gray
    800: '#292524',  // Very dark gray
    900: '#1c1917',  // Near black
  }
};

// Glass morphism styles with pastel tints
export const glassStyles = {
  light: 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-pastel-lavender/10',
  dark: 'dark:bg-gray-900/50 dark:backdrop-blur-xl dark:border dark:border-gray-700/30',
  card: 'bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-md',
  hover: 'hover:bg-white/80 hover:shadow-xl hover:shadow-pastel-lavender/20 transition-all duration-300'
};

// Gradient configurations
export const gradients = {
  primary: 'bg-gradient-to-br from-pastel-lavender via-pastel-sky to-pastel-mint',
  secondary: 'bg-gradient-to-br from-pastel-peach via-pastel-rose to-pastel-lavender',
  accent: 'bg-gradient-to-br from-pastel-mint via-pastel-sage to-pastel-sky',
  warm: 'bg-gradient-to-br from-pastel-peach via-pastel-coral to-pastel-lemon',
  cool: 'bg-gradient-to-br from-pastel-sky via-pastel-lavender to-pastel-powder',
  subtle: 'bg-gradient-to-br from-white/90 via-pastel-pearl to-white/80'
};