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
          950: "#020617",
          900: "#0F172A",
          800: "#1E293B",
          700: "#334155",
          accent: "#2563EB",
          deficit: "#EF4444",
          surplus: "#10B981",
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
