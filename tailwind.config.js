/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'vibe-dark': '#1a1a1a',
        'vibe-gray': '#2a2a2a',
        'vibe-light': '#3a3a3a',
        'vibe-border': '#444444',
        'vibe-accent': '#6366f1',
      }
    },
  },
  plugins: [],
}
