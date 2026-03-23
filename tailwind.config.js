/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "surface": "#101319",
        "surface-container-low": "#191c22",
        "surface-container": "#1d2026",
        "surface-container-high": "#272a31",
        "surface-container-highest": "#32353c",
        "surface-bright": "#363940",
        "on-surface": "#e1e2eb",
        "on-surface-variant": "#c4c6d0",
        "outline": "#8e9099",
        "outline-variant": "#44474f",
        "primary": "#ffb3ae",
        "primary-container": "#ff5351",
        "on-primary-fixed": "#410004",
        "secondary": "#43e1ba",
        "error": "#ffb4ab",
        "error-container": "#93000a",
      },
      fontFamily: {
        "label": ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
}