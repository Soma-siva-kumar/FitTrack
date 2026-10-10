/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#0c0e11', // Deep background
          900: '#14181c', // Card / surface base
          850: '#1a1f24', // Card elevated
          800: '#232a31', // Card borders & highlights
          700: '#343e49',
          600: '#475569',
          400: '#94a3b8',
          200: '#e2e8f0',
          100: '#f1f5f9',
        },
        fitness: {
          green: '#10b981', // Emerald primary
          neon: '#22c55e',  // High contrast accent
          cyan: '#06b6d4',  // Water / hydration
          amber: '#f59e0b', // Calories / energy
          rose: '#f43f5e',  // Heart / intensity
          purple: '#8b5cf6', // Sleep
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.3)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
