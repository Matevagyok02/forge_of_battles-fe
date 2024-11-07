/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        amarante: ["Amarante", "serif"],
        sorceCodeProp: ["Source Code Pro", "monospace"],
      },
      colors: {
        gold: "#FFBF00"
      }
    }
  },
  plugins: []
}

