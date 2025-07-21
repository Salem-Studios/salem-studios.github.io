/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/app/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        jacquard: ['var(--font-jacquard)'],
        vt323: ['var(--font-vt323)'],
      },
    },
  },
  plugins: [],
}
