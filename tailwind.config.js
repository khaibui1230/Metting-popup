/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink: '#FCE4EC',
          'pink-deep': '#F8BBD0',
          cream: '#FFF9E3',
          white: '#FFFFFF',
          soft: '#E3F2FD',
          lavender: '#F3E5F5',
          gold: '#FFD54F',
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        handwriting: ['"Dancing Script"', 'cursive'],
      },
      animation: {
        'heart-beat': 'heart-beat 1s infinite',
        'flip': 'flip 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'heart-beat': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'flip': {
          '0%': { transform: 'rotateY(0)' },
          '100%': { transform: 'rotateY(180deg)' },
        }
      }
    },
  },
  plugins: [],
}
