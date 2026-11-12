/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          bg: '#000000',
          card: '#161617',
          cardHover: '#1c1c1e',
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#0A84FF',
          accentGreen: '#30D158',
          accentOrange: '#FF9F0A',
          subtext: '#86868b'
        }
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Segoe UI"',
          'Roboto',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
