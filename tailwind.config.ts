import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // Pastel Color Palette
        pastel: {
          mint: '#b8e6d3',
          peach: '#ffd6cc',
          sky: '#c3e7ff',
          lavender: '#e5d4ff',
          rose: '#ffd4e5',
          lemon: '#fff5d6',
          sage: '#d4e6d4',
          powder: '#e6d9ff',
          coral: '#ffccb3',
          pearl: '#f5f3f0',
        },
        primary: {
          50: '#f0f4ff',
          100: '#e5edff',
          200: '#c3d9ff',
          300: '#a3c0ff',
          400: '#7e9eff',
          500: '#6b85e8',
          600: '#5a70d6',
        },
        success: {
          light: '#d1f4e0',
          DEFAULT: '#a8e6c1',
          dark: '#7bc99c',
        },
        warning: {
          light: '#fff4e1',
          DEFAULT: '#ffdd9e',
          dark: '#f4c67d',
        },
        error: {
          light: '#ffe0e0',
          DEFAULT: '#ffb3b3',
          dark: '#ff9999',
        },
        info: {
          light: '#e1f0ff',
          DEFAULT: '#b3d9ff',
          dark: '#8ac4ff',
        },
      },
      backgroundImage: {
        'gradient-pastel': 'linear-gradient(135deg, #f0f4ff 0%, #ffd6cc 25%, #c3e7ff 50%, #e5d4ff 75%, #b8e6d3 100%)',
        'gradient-soft': 'linear-gradient(135deg, #fff5d6 0%, #ffd4e5 50%, #e6d9ff 100%)',
      },
    },
  },
  plugins: [],
}
export default config
