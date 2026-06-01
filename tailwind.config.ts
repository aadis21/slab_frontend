import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A5C3A',
          50: '#E8F5EE',
          100: '#C6E6D4',
          200: '#9ED1B5',
          300: '#6EBC93',
          400: '#3DA770',
          500: '#1A5C3A',
          600: '#154A2F',
          700: '#103824',
          800: '#0B2619',
          900: '#06140D',
        },
        gold: {
          DEFAULT: '#D4AF37',
          50: '#FBF6E0',
          100: '#F5E9B3',
          200: '#EDDA80',
          300: '#E5CB4D',
          400: '#DCBD1F',
          500: '#D4AF37',
          600: '#A98C2C',
          700: '#7E6921',
          800: '#534616',
          900: '#29230B',
        },
        background: '#F8F9FA',
        surface: '#FFFFFF',
        'text-dark': '#1A1A1A',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '0.625rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)',
        'card-hover': '0 4px 16px 0 rgb(0 0 0 / 0.12)',
        glow: '0 0 20px rgba(26, 92, 58, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
