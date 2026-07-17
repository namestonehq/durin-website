import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "stone-150": "#F2F1F1",
      },
      transitionDuration: {
        "10000": "10000ms",
      },
    },
  },
  plugins: [],
};
export default config;
