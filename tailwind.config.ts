import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'young-serif': ['var(--font-young-serif)', 'serif'],
        'bitter': ['var(--font-bitter)', 'serif'],
      },
      colors: {
        primary: {
          main: '#8c52ff',
          light: '#a366ff',
          dark: '#6b3fd9',
          hover: '#7a47e6',
        },
      },
    },
  },
  plugins: [],
};

export default config;
