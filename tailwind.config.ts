import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          950: "#07160d",
          900: "#0d2818",
          800: "#143422",
          700: "#1e482f",
          accent: "#16a34a",
          "accent-hover": "#22c55e",
          deficit: "#ef4444",
          surplus: "#10b981",
        },
      },
      fontFamily: {
        mono: ["Consolas", "Courier Prime", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
