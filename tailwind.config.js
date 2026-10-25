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
        navy: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c5daf0',
          300: '#9ec1e6',
          400: '#5a92d4',
          500: '#2b6cb0',
          600: '#1e528e',
          700: '#1b4171',
          800: '#132d50',
          900: '#0B192C',
          950: '#060e19',
        },
        brand: {
          cyan: '#00ADB5',
          'cyan-hover': '#00969d',
          'cyan-light': '#3ddbe3',
          'cyan-glow': 'rgba(0, 173, 181, 0.25)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(11, 25, 44, 0.06), 0 2px 6px -1px rgba(11, 25, 44, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(0, 173, 181, 0.12), 0 4px 12px -2px rgba(11, 25, 44, 0.08)',
        'glow-cyan': '0 0 20px rgba(0, 173, 181, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'pulse-subtle': 'pulseSubtle 2.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        }
      }
    },
  },
  plugins: [],
}
