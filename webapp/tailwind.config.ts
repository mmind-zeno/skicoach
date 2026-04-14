import type { Config } from "tailwindcss";
import { sk } from "./src/lib/colors";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sk: {
          ink: sk.ink,
          brand: sk.brand,
          hover: sk.brandHover,
          cta: sk.cta,
          "cta-hover": sk.ctaHover,
          "cta-mid": sk.ctaMid,
          surface: sk.surface,
          container: sk.container,
          "container-low": sk.containerLow,
          "container-high": sk.containerHigh,
          "container-highest": sk.containerHighest,
          "badge-bg": sk.badgeBg,
          "badge-fg": sk.badgeFg,
          highlight: sk.highlight,
          outline: sk.outlineMuted,
        },
      },
      boxShadow: {
        "sk-ambient":
          "0 24px 40px -12px rgba(24, 28, 32, 0.08), 0 8px 16px -8px rgba(24, 28, 32, 0.06)",
        "sk-nav":
          "4px 0 24px rgba(24, 28, 32, 0.08)",
      },
    },
  },
  plugins: [],
};
export default config;
