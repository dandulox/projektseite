/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Apple-inspired color palette
        'apple': {
          50: '#f5f5f7',
          100: '#e5e5e7',
          200: '#d2d2d7',
          300: '#c7c7cc',
          400: '#a1a1a6',
          500: '#86868b',
          600: '#6e6e73',
          700: '#48484a',
          800: '#38383a',
          900: '#1c1c1e',
        },
        // Custom accent colors
        'accent': {
          blue: '#0071e3',
          'blue-hover': '#0077ed',
          green: '#34c759',
          purple: '#af52de',
          orange: '#ff9500',
          red: '#ff3b30',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'apple': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'apple-dark': '0 4px 20px rgba(0, 0, 0, 0.3)',
        'apple-subtle': '0 2px 8px rgba(0, 0, 0, 0.04)',
        'apple-subtle-dark': '0 2px 8px rgba(0, 0, 0, 0.2)',
      },
      borderRadius: {
        'apple': '16px',
        'apple-lg': '20px',
        'apple-xl': '24px',
      }
    },
  },
  plugins: [],
}
