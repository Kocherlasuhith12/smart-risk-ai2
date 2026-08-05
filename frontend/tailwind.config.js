/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#10b981', dark: '#059669' },
        danger:  '#ef4444',
        warning: '#f59e0b',
        success: '#22c55e',
      }
    }
  },
  plugins: []
}
 
