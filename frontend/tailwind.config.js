/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Government-clean palette
        primary: {
          DEFAULT: '#1B4B91', // Digital India blue
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#C4732A', // Muted saffron/amber
          foreground: '#FFFFFF',
        },
        // FRAC domain coding
        frac: {
          behavioural: '#C4732A',
          domain: '#1B4B91',
          functional: '#0F7A72',
        },
        // Semantic
        success: '#2E7D4F',
        warning: '#B8860B',
        danger: '#B3261E',
        // Neutrals
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#1B4B91',
        background: '#F7F8FA',
        foreground: '#1A1D23',
        muted: {
          DEFAULT: '#F1F5F9',
          foreground: '#64748B',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1A1D23',
        },
      },
      fontFamily: {
        sans: ['Inter', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
