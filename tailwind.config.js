/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'white',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'white',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'white',
        },
      },
    },
  },
  plugins: [],
};
