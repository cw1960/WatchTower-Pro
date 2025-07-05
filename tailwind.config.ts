import type { Config } from "tailwindcss";
import { frostedThemePlugin } from "@whop/react/tailwind";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Ensure gradient classes are included
    { pattern: /bg-gradient-to-(r|l|t|b|tl|tr|bl|br)/ },
    {
      pattern:
        /from-(blue|purple|cyan|green|emerald|yellow|orange|red|pink|slate)-(400|500|600|700|800|900)/,
    },
    {
      pattern:
        /via-(blue|purple|cyan|green|emerald|yellow|orange|red|pink|slate)-(400|500|600|700|800|900)/,
    },
    {
      pattern:
        /to-(blue|purple|cyan|green|emerald|yellow|orange|red|pink|slate)-(400|500|600|700|800|900)/,
    },
    "bg-clip-text",
    "text-transparent",
    "backdrop-blur-sm",
    "animate-pulse",
    "hover:scale-105",
    "transition-all",
    "duration-200",
    "shadow-lg",
    "shadow-xl",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
    },
  },
  plugins: [frostedThemePlugin()],
};

export default config;
