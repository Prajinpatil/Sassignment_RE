/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0B1120',
          card: '#111827',
          border: '#1F2937',
          accent: '#06B6D4',
          wind: '#10B981',
          thermal: '#F59E0B',
          alert: '#EF4444'
        }
      }
    },
  },
  plugins: [],
}
