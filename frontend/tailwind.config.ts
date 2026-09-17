/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Black & Dark Chrome Palette
        dark: {
          950: '#000000',
          900: '#050505',
          850: '#080808',
          800: '#0D0D0D',
          750: '#121212',
          700: '#181818',
          600: '#222222',
        },
        // Slate neutrals
        slate: {
          850: '#0c0f17',
          900: '#080a10',
          950: '#040508',
        },
        // Primary Yellow & Gold Accent
        yellow: {
          300: '#FFF066',
          400: '#FFE033',
          500: '#FFD400', // Bright Accent
          600: '#EAB308', // Secondary Gold
          700: '#CA8A04',
          800: '#854D0E',
        },
        brand: {
          50:  '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          300: '#FDE047',
          400: '#FFE033',
          500: '#FFD400', // Brand Primary
          600: '#EAB308',
          700: '#CA8A04',
          800: '#A16207',
          900: '#713F12',
        },
        // Semantic accents
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'glass-card': 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)',
        'glass-hover': 'linear-gradient(135deg, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 100%)',
        'yellow-gradient': 'linear-gradient(135deg, #FFD400 0%, #EAB308 100%)',
        'gold-metallic': 'linear-gradient(135deg, #FFF066 0%, #FFD400 50%, #CA8A04 100%)',
        'dark-radial': 'radial-gradient(ellipse at top, #141414 0%, #050505 70%, #000000 100%)',
        'yellow-ambient': 'radial-gradient(circle at 50% 0%, rgba(255, 212, 0, 0.12) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'orbit': 'orbit 20s linear infinite',
        'spin-slow': 'spin 15s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        orbit: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.6)',
        'glass-edge': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
        'glow-yellow': '0 0 25px rgba(255, 212, 0, 0.25)',
        'glow-yellow-sm': '0 0 12px rgba(255, 212, 0, 0.18)',
        'glow-yellow-lg': '0 0 50px rgba(255, 212, 0, 0.35)',
        'button-yellow': '0 4px 20px rgba(255, 212, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
      },
      borderRadius: {
        'xl': '1.0rem',
        '2xl': '1.35rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
}
