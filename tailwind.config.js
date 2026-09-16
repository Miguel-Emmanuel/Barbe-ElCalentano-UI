/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1a0f0c",
        charcoal: "#2a1612",
        gold: {
          DEFAULT: "#C9A227",
          soft: "#E0C56A",
          deep: "#8A7015",
        },
        bone: "#F7F0E6",
        brick: {
          DEFAULT: "#B33B2E",
          soft: "#D25542",
          deep: "#7A241C",
          mortar: "#C4A484",
        },
        brickSoft: "#D25542",
      },
      fontFamily: {
        display: ["var(--font-display)", "cursive"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brick-wall":
          "linear-gradient(160deg, rgba(26,15,12,.70), rgba(26,15,12,.52)), url('/textures/brick-wall.png')",
        "brick-wall-soft":
          "linear-gradient(180deg, rgba(26,15,12,.48), rgba(26,15,12,.75)), url('/textures/brick-wall.png')",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(26, 15, 12, 0.45)",
      },
    },
  },
  plugins: [],
};
