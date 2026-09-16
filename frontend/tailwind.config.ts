import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{vue,ts}',
    './components/**/*.{vue,ts}',
    './layouts/**/*.{vue,ts}',
    './pages/**/*.{vue,ts}',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        accent: {
          100: '#eef6ff',
          200: '#d6ebff',
          300: '#b5d9fd',
          400: '#94bce3',
          500: '#749dc4',
          600: '#597ea3',
          700: '#416180',
          800: '#2c455d',
          900: '#1d2d3d',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
