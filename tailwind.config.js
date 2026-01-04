/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vibe: {
          900: '#0f1115',
          800: '#15181e',
          700: '#1e232b',
          600: '#262c36',
          500: '#303846',
          400: '#4b5563',
          300: '#6b7280',
          200: '#94a3b8',
          100: '#e2e8f0',
        },
        'vibe-dark': '#15181e',
        'vibe-gray': '#1e232b',
        'vibe-light': '#303846',
        'vibe-border': '#262c36',
        'vibe-accent': '#6366f1',
      },
      boxShadow: {
        soft: '0 12px 30px -20px rgba(15, 23, 42, 0.6)',
        card: '0 24px 50px -28px rgba(15, 23, 42, 0.75)',
      },
      borderRadius: {
        'radius-lg': '0.75rem',
        'radius-xl': '1rem',
      },
    },
  },
  plugins: [],
}
