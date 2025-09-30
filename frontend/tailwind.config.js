/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef7ee',
          100: '#fdedd3',
          200: '#fbd7a5',
          300: '#f8ba6d',
          400: '#f59333',
          500: '#f2760b',
          600: '#e35a06',
          700: '#bc4209',
          800: '#96350e',
          900: '#792d0f',
        }
      }
    },
  },
  plugins: [],
}
