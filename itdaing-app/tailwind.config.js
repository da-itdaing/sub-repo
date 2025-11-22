import safeArea from 'tailwindcss-safe-area';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  plugins: [
    safeArea,
  ],
}

