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
        board: {
          light: '#f0f9ff',
          dark: '#1e293b',
        }
      }
    },
  },
  plugins: [],
}
