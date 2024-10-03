/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        amarante: ["Amarante", "serif"]
      },
      colors: {
        gold: "#FFBF00"
      }
    }
  },
  plugins: []
}

