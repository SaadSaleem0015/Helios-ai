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
            DEFAULT: '#fab200',  // Your main yellow
            light: '#ffcc33',    // Lighter variant
            dark: '#e6a600',     // Darker variant
            hover: '#ffc107',    // Hover state
            50: '#fffdf4',       // Very light
            100: '#fff8d6',
            200: '#ffedab',
            300: '#ffdf76',
            400: '#ffcc33',
            500: '#fab800',      // Main color
            600: '#e6a600',
            700: '#bf8a00',
            800: '#996f00',
            900: '#7d5b00',
          },
        },
      },
    },
  plugins: [],
};