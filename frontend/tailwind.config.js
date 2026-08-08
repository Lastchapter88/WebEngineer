/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'wood': '#d99b62',
        'blue': '#34a0ff',
        'slate': '#121821',
        'navy': '#0d131b'
      },
    },
  },
  plugins: [],
}
