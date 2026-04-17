/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0a',
        card: '#141414',
        cardHover: '#1c1c1c',
        primaryText: '#ffffff',
        secondaryText: '#8a8a8a',
        accent: '#5a6270', // subtle silver/blue
        success: '#1ea97c', // elegant green
        danger: '#cf6679', // muted red
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
