import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f6f7f4",
          100: "#eef0ea",
          200: "#dce0d6",
          300: "#c0c7b8",
          400: "#8f9888",
          500: "#6b7464",
          600: "#525a4c",
          700: "#3f453b",
          800: "#2a2f28",
          900: "#171a16",
          950: "#0d0f0c",
        },
        accent: {
          DEFAULT: "#0f766e",
          hover: "#0d5f59",
          soft: "#ccfbf1",
          muted: "#f0fdfa",
        },
        sand: {
          50: "#f7f4ed",
          100: "#f3efe6",
          200: "#e7e0d2",
          300: "#d6cdb8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(23, 26, 22, 0.04), 0 8px 24px rgba(23, 26, 22, 0.06)",
        lift: "0 12px 40px rgba(23, 26, 22, 0.1)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s ease-out both",
        "fade-in": "fade-in 0.4s ease-out both",
        "scale-in": "scale-in 0.35s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
