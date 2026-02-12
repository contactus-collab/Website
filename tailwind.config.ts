import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
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
        },
        brand: {
          blue: '#2D66B4',
          primaryBlue: '#0F006A',
          purple: '#5F27CD',
          'purple-dark': '#0F006A',
          'purple-light': '#f5f0ff',
          'purple-deep': '#5236CC',
          'purple-pill': '#DBD3F5',
          'mission-bg': '#F6F3FD',
        },
      },
      borderRadius: {
        squircle: '2rem',
        'squircle-lg': '2.5rem',
      },
    },
  },
  plugins: [],
}

export default config

