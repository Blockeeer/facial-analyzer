/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PeptiScan Green Palette (#3ABE26)
        primary: {
          50: '#f0fdf0',
          100: '#dcfcda',
          200: '#bbf7b7',
          300: '#86ef81',
          400: '#4ede44',
          500: '#3ABE26',
          600: '#2a9e1a',
          700: '#237b17',
          800: '#216118',
          900: '#1d5117',
          950: '#0a2d08',
        },
        secondary: {
          50: '#f0fdf0',
          100: '#dcfcda',
          200: '#bbf7b7',
          300: '#86ef81',
          400: '#4ede44',
          500: '#3ABE26',
          600: '#2a9e1a',
          700: '#237b17',
          800: '#216118',
          900: '#1d5117',
          950: '#0a2d08',
        },
        accent: {
          50: '#f0fdf0',
          100: '#dcfcda',
          200: '#bbf7b7',
          300: '#86ef81',
          400: '#4ede44',
          500: '#3ABE26',
          600: '#2a9e1a',
          700: '#237b17',
          800: '#216118',
          900: '#1d5117',
          950: '#0a2d08',
        },
        dark: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#3f3f46',
          800: '#27272a',
          850: '#1f1f23',
          900: '#18181b',
          950: '#0a0a0b',
        },
        skin: {
          light: '#fef3e2',
          medium: '#f5d5b8',
          dark: '#d4a574',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(58, 190, 38, 0.3)',
        'glow-lg': '0 0 40px rgba(58, 190, 38, 0.4)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
