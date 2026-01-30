/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // CocinIA custom color palette
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',  // Primary brand color (light mode)
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          DEFAULT: '#16a34a',
        },
        // Semantic colors
        surface: {
          DEFAULT: '#f9fafb',
          dark: '#1f2937',
        },
        error: {
          DEFAULT: '#ef4444',
          dark: '#f87171',
        },
        success: {
          DEFAULT: '#22c55e',
          dark: '#4ade80',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fef3c7',
        },
        info: {
          DEFAULT: '#2563eb',
          light: '#dbeafe',
        },
      },
    },
  },
  plugins: [],
};