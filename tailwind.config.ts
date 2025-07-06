import type { Config } from "tailwindcss";
import { frostedThemePlugin } from "@whop/react/tailwind";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // Gradient backgrounds
    "bg-gradient-to-r",
    "bg-gradient-to-br",
    "bg-gradient-to-l",
    "bg-gradient-to-t",
    "bg-gradient-to-b",
    
    // From colors
    "from-blue-400", "from-blue-500", "from-blue-600", "from-blue-700",
    "from-purple-400", "from-purple-500", "from-purple-600", "from-purple-700",
    "from-cyan-400", "from-cyan-500", "from-cyan-600", "from-cyan-700",
    "from-green-400", "from-green-500", "from-green-600", "from-green-700",
    "from-emerald-400", "from-emerald-500", "from-emerald-600", "from-emerald-700",
    "from-yellow-400", "from-yellow-500", "from-yellow-600", "from-yellow-700",
    "from-orange-400", "from-orange-500", "from-orange-600", "from-orange-700",
    "from-red-400", "from-red-500", "from-red-600", "from-red-700",
    "from-pink-400", "from-pink-500", "from-pink-600", "from-pink-700",
    "from-slate-400", "from-slate-500", "from-slate-600", "from-slate-700", "from-slate-800", "from-slate-900",
    
    // Via colors
    "via-blue-400", "via-blue-500", "via-blue-600", "via-blue-700", "via-blue-900",
    "via-purple-400", "via-purple-500", "via-purple-600", "via-purple-700",
    "via-cyan-400", "via-cyan-500", "via-cyan-600", "via-cyan-700",
    
    // To colors
    "to-blue-400", "to-blue-500", "to-blue-600", "to-blue-700",
    "to-purple-400", "to-purple-500", "to-purple-600", "to-purple-700",
    "to-cyan-400", "to-cyan-500", "to-cyan-600", "to-cyan-700",
    "to-green-400", "to-green-500", "to-green-600", "to-green-700",
    "to-emerald-400", "to-emerald-500", "to-emerald-600", "to-emerald-700",
    "to-yellow-400", "to-yellow-500", "to-yellow-600", "to-yellow-700",
    "to-orange-400", "to-orange-500", "to-orange-600", "to-orange-700",
    "to-red-400", "to-red-500", "to-red-600", "to-red-700",
    "to-pink-400", "to-pink-500", "to-pink-600", "to-pink-700",
    "to-slate-400", "to-slate-500", "to-slate-600", "to-slate-700", "to-slate-800", "to-slate-900",
    
    // Text colors for gradients
    "text-blue-300", "text-purple-300", "text-cyan-300", "text-green-300", "text-emerald-300",
    "text-yellow-300", "text-orange-300", "text-red-300", "text-pink-300", "text-slate-300",
    
    // Border colors
    "border-blue-400", "border-purple-400", "border-cyan-400", "border-green-400", "border-emerald-400",
    "border-yellow-400", "border-orange-400", "border-red-400", "border-pink-400", "border-slate-400",
    
    // Other effects
    "bg-clip-text",
    "text-transparent",
    "backdrop-blur-sm",
    "animate-pulse",
    "hover:scale-105",
    "transition-all",
    "duration-200", "duration-300",
    "shadow-lg",
    "shadow-xl", "shadow-2xl",
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
