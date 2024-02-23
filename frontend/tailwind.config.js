import daisyui from "daisyui";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  daisyui: {
    themes: [
      "light",
      "corporate",
      "fantasy",
      "cmyk",
      "business",
      "black",
      "dim",
      "forest",
    ],
    darkTheme: "business",
  },
  theme: {
    container: {
      center: true,
      padding: "2rem",
    },
    extend: {},
  },
  plugins: [daisyui],
};
