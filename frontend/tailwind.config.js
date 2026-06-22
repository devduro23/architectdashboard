/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#C0392B',
          hover: '#A93226',
          light: '#FDEDEC',
        },
        coral: '#E8613C',
        surface: '#FFFFFF',
        elevated: '#FFF0F0',
        border: '#F5DADA',
        muted: '#A87070',
        text: {
          primary: '#1C1010',
          secondary: '#3D2B2B',
          muted: '#A87070',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(180,60,60,0.07), 0 1px 2px rgba(0,0,0,0.04)',
        elevated: '0 4px 12px rgba(180,60,60,0.10)',
        drawer: '-4px 0 24px rgba(180,60,60,0.12)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #C0392B 0%, #E8613C 100%)',
      },
    },
  },
  plugins: [],
};
