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
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sk: {
          ink: sk.ink,
          brand: sk.brand,
          hover: sk.brandHover,
          surface: sk.surface,
        },
      },
    },
  },
  plugins: [],
};
export default config;
