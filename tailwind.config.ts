import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#145085",
        },
        secondary: {
          DEFAULT: "#2497cc",
        },
        gray: {
          DEFAULT: "#4b5563",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
