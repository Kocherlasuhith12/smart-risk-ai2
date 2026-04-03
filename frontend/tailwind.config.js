/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#6366f1', dark: '#4f46e5' },
        danger:  '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
      }
    }
  },
  plugins: []
}
 
