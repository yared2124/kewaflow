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
        kewa: {
          teal: "#0E3B43",
          "teal-light": "#134E5E",
          "teal-hover": "#0A2B31",
          cyan: "#00CECB",
          "cyan-subtle": "#E0F7FA",
          "cyan-dark": "#00838F",
          navy: "#0B132B",
          bg: "#F4F6F8",
          card: "#FFFFFF",
          border: "#E2E8F0",
          "text-dark": "#0F172A",
          "text-muted": "#64748B",
          "amber-subtle": "#FEF3C7",
          "amber-dark": "#D97706",
          "emerald-subtle": "#D1FAE5",
          "emerald-dark": "#059669",
          "blue-subtle": "#DBEAFE",
          "blue-dark": "#1D4ED8",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
