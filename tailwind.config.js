/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        navy: {
          950: '#0a0f1a',
          900: '#0f1729',
          850: '#121c32',
          800: '#162238',
          700: '#1e2f4d',
        },
        cyan: {
          glow: '#22d3ee',
          muted: '#0891b2',
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(14, 165, 233, 0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
        card: '0 4px 24px rgba(14, 165, 233, 0.08)',
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'gradient-slow': 'gradient-shift 18s ease infinite',
        'fade-up': 'fade-up 0.65s ease-out forwards',
        'fade-up-soft': 'fade-up-soft 0.5s ease-out forwards',
        'sky-pulse': 'sky-pulse 4.5s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up-soft': {
          from: { transform: 'translateY(10px)' },
          to: { transform: 'translateY(0)' },
        },
        'sky-pulse': {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.65' },
        },
      },
    },
  },
  plugins: [],
};
