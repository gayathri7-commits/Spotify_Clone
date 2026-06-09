/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1DB954',
          dark: '#0B0B0C',
          black: '#040405',
          lightdark: '#121214',
          card: 'rgba(30, 30, 35, 0.65)',
          textLight: '#A0A0AB',
        },
        neon: {
          orange: '#FF5A09',
          amber: '#FFB300',
          cyan: '#00E5FF',
          green: '#39FF14',
          purple: '#BD00FF',
        }
      },
      boxShadow: {
        'neon-amber': '0 0 15px rgba(255, 179, 0, 0.35)',
        'neon-orange': '0 0 15px rgba(255, 90, 9, 0.35)',
        'neon-green': '0 0 15px rgba(57, 255, 20, 0.35)',
        'neon-cyan': '0 0 15px rgba(0, 229, 255, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

