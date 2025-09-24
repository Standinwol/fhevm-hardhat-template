/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "game-bg": "#faf8ef",
        "game-border": "#bbada0",
        "tile-empty": "#cdc1b4",
        "tile-2": "#eee4da",
        "tile-4": "#ede0c8",
        "tile-8": "#f2b179",
        "tile-16": "#f59563",
        "tile-32": "#f67c5f",
        "tile-64": "#f65e3b",
        "tile-128": "#edcf72",
        "tile-256": "#edcc61",
        "tile-512": "#edc850",
        "tile-1024": "#edc53f",
        "tile-2048": "#edc22e",
        "tile-4096": "#3c3a32",
        "tile-8192": "#3c3a32",
      },
      fontFamily: {
        game: ["Arial", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        pop: "pop 0.2s ease-in-out",
        slide: "slide 0.15s ease-in-out",
      },
    },
  },
  plugins: [],
};
