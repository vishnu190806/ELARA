import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // ELARA palette
        space: {
          DEFAULT: "#0a0a0f",
          800: "#111118",
          700: "#1a1a2e",
          600: "#242438",
        },
        "elara-blue": {
          DEFAULT: "#3b82f6",
          dim: "#1d4ed8",
          glow: "#60a5fa",
        },
        "elara-purple": {
          DEFAULT: "#8b5cf6",
          dim: "#6d28d9",
          glow: "#a78bfa",
        },
        "elara-border": "rgba(59,130,246,0.15)",
      },
      boxShadow: {
        "glow-blue": "0 0 20px rgba(59,130,246,0.3), 0 0 60px rgba(59,130,246,0.1)",
        "glow-purple": "0 0 20px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)",
        "glow-blue-sm": "0 0 8px rgba(59,130,246,0.4)",
        "glow-purple-sm": "0 0 8px rgba(139,92,246,0.4)",
        "card": "0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.4)",
        "card-hover": "0 0 0 1px rgba(59,130,246,0.3), 0 4px 32px rgba(59,130,246,0.15)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "space-gradient": "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(59,130,246,0.15), transparent)",
        "hero-gradient": "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(139,92,246,0.2) 0%, rgba(59,130,246,0.1) 40%, transparent 70%)",
      },
      animation: {
        "spin-slow": "spin 8s linear infinite",
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
