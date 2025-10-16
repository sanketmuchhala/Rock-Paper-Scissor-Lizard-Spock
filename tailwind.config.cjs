/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#000000',
          dark: '#111111',
        },
        primary: {
          DEFAULT: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F0F0F0',
        },
        accent: {
          DEFAULT: '#C8C8C8',
        }
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: 0.1 },
          '50%': { opacity: 0.3 },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        }
      },
      fontFamily: {
        sans: ['Times New Roman', 'Times', 'serif'],
      }
    },
  },
  plugins: [],
}