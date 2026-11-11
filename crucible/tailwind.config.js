/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: {
          DEFAULT: '#1a1612',
          light: '#2a241f',
          dark: '#0f0d0b'
        },
        parchment: {
          DEFAULT: '#f5f0e6',
          dark: '#e8e0d0'
        },
        bronze: {
          DEFAULT: '#b08d57',
          light: '#c9a87a',
          dark: '#8a6d3f'
        },
        ember: {
          DEFAULT: '#d4784a',
          light: '#e8956a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif']
      }
    },
  },
  plugins: [],
}
