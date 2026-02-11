/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0C0F1A',
          card: '#141829',
          elevated: '#1C2038',
          input: '#0E1225',
          border: '#2A2F4A',
          accent: '#D4A853',
          'accent-light': '#E8C878',
          'accent-dark': '#B8923A',
          text: '#E8E9F0',
          muted: '#8B8FA8',
          dim: '#5C6080',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
