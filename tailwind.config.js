/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14110F",
        charcoal: "#241C18",
        /* Acento fino (terracota del ladrillo). Los botones usan hueso, no este tono. */
        gold: {
          DEFAULT: "#C45C4A",
          soft: "#E4B2A4",
          deep: "#8E3A30",
        },
        bone: "#F4EFE8",
        brick: {
          DEFAULT: "#C45C4A",
          soft: "#A33B32",
          deep: "#6E2A24",
          mortar: "#C4B09A",
        },
        brickSoft: "#A33B32",
      },
      fontFamily: {
        display: ["var(--font-display)", "cursive"],
        sans: [
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "brick-wall":
          "linear-gradient(160deg, rgba(20,17,15,.72), rgba(20,17,15,.55)), url('/textures/brick-wall.png')",
        "brick-wall-soft":
          "linear-gradient(180deg, rgba(20,17,15,.50), rgba(20,17,15,.78)), url('/textures/brick-wall.png')",
      },
      boxShadow: {
        panel: "0 18px 50px rgba(20, 17, 15, 0.45)",
      },
    },
  },
  plugins: [],
};
