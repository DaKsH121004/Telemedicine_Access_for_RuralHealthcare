/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom healthcare color scheme for rural population
        primary: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          600: '#2563EB',  // Primary Blue - Trust, healthcare
          700: '#1D4ED8',
          800: '#1E40AF',
        },
        health: {
          600: '#16A34A',  // Health Green - Wellness, CTAs
          700: '#15803D',
        },
        emergency: {
          600: '#DC2626',  // Red - High urgency
          700: '#B91C1C',
        },
        warning: {
          500: '#F59E0B',  // Amber - Medium urgency
          600: '#D97706',
        },
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',  // Light background
          200: '#E5E7EB',
          800: '#1F2937',  // Body text
          900: '#111827',  // Headings
        }
      }
    },
  },
  plugins: [],
  darkMode: 'class',
}

