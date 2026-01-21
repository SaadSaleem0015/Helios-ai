/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#a4c2dc',  // Main blue
          light: '#c6d9ea',    // Lighter variant
          dark: '#7fa6c8',     // Darker variant
          hover: '#93b6d6',    // Hover state

          50:  '#f5f8fc',
          100: '#e6eef6',
          200: '#cfddec',
          300: '#b8cce2',
          400: '#a4c2dc',
          500: '#8fb3d3',      // Main usable shade
          600: '#7fa6c8',
          700: '#678db0',
          800: '#4f6f8c',
          900: '#3b5368',
        },
      },
    },
  },
  plugins: [],
};
