/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        vibe: {
          950: '#08090c',
          900: '#0f1115',
          800: '#15181e',
          700: '#1e232b',
          600: '#262c36',
          500: '#303846',
          400: '#4b5563',
          300: '#6b7280',
          200: '#94a3b8',
          100: '#cbd5e1',
          50:  '#f1f5f9',
        },
        'vibe-dark': '#15181e',
        'vibe-gray': '#1e232b',
        'vibe-light': '#303846',
        'vibe-border': '#262c36',
        accent: {
          DEFAULT: '#e08a4e',
          light: '#f0a870',
          muted: 'rgba(224, 138, 78, 0.15)',
          dim: 'rgba(224, 138, 78, 0.08)',
        },
        teal: {
          DEFAULT: '#3ecfb4',
          light: '#6ee7c8',
          muted: 'rgba(62, 207, 180, 0.15)',
          dim: 'rgba(62, 207, 180, 0.08)',
        },
        recording: '#ef4444',
        success: '#22c55e',
        info: '#3b82f6',
      },
      boxShadow: {
        soft: '0 12px 30px -20px rgba(15, 23, 42, 0.6)',
        card: '0 24px 50px -28px rgba(15, 23, 42, 0.75)',
        glow: '0 0 20px rgba(224, 138, 78, 0.25), 0 0 60px rgba(224, 138, 78, 0.08)',
        'glow-teal': '0 0 20px rgba(62, 207, 180, 0.25), 0 0 60px rgba(62, 207, 180, 0.08)',
        'inner-light': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
      },
      borderRadius: {
        'radius-lg': '0.75rem',
        'radius-xl': '1rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.6' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-in-up': 'fade-in-up 0.4s ease-out',
        'fade-in-down': 'fade-in-down 0.4s ease-out',
        'slide-in-left': 'slide-in-left 0.5s ease-out',
        'slide-in-right': 'slide-in-right 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        float: 'float 3s ease-in-out infinite',
        breathe: 'breathe 3s ease-in-out infinite',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        '.stagger-1': { 'animation-delay': '0.1s', 'animation-fill-mode': 'both' },
        '.stagger-2': { 'animation-delay': '0.2s', 'animation-fill-mode': 'both' },
        '.stagger-3': { 'animation-delay': '0.3s', 'animation-fill-mode': 'both' },
      })
    },
  ],
}
