/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      }
    },
  },
  plugins: [],
  corePlugins: {
    // Disable oklch colors for compatibility with html2canvas
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
}
