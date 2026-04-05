/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Source Code Pro', 'monospace'],
      },
      animation: {
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'gradient-shift': 'gradientShift 8s ease infinite',
        'scan-line': 'scanLine 4s linear infinite',
        'grid-move': 'gridMove 20s linear infinite',
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 5px rgba(0,229,255,0.3), 0 0 10px rgba(0,229,255,0.15)',
          },
          '50%': {
            boxShadow: '0 0 20px rgba(0,229,255,0.5), 0 0 40px rgba(0,229,255,0.25)',
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        blink: {
          '50%': { opacity: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        scanLine: {
          '0%': { top: '0%' },
          '100%': { top: '100%' },
        },
        gridMove: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(60px, 60px)' },
        },
      },
    },
  },
  plugins: [],
};