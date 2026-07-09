/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'oled': '#05050A',
        'aurora-violet': '#8B5CF6',
        'aurora-cyan': '#06B6D4',
        'aurora-pink': '#EC4899',
        'surface-panel': 'rgba(255, 255, 255, 0.03)',
        'surface-border': 'rgba(255, 255, 255, 0.08)',
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#52525B', // Neutral muted text
          700: '#2A2A2A', // Dark mode inputs/borders (Whiter)
          800: '#000000', // Dark mode panels/nav/side (Darker/OLED Black)
          900: '#121212', // Dark mode background/body (Whiter/Dark Grey)
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['Syne', 'sans-serif'],
      },
      animation: {
        'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
        'star-movement-top': 'star-movement-top linear infinite alternate',
        'blob': 'blob 7s infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        'star-movement-bottom': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
        },
        'star-movement-top': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      },
      boxShadow: {
        'ambient': '0 0 40px -10px var(--tw-shadow-color)',
        'island': '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255,255,255,0.05)',
      }
    },
  },
  plugins: [],
}
