/** @type {import('tailwindcss').Config} */
module.exports = {
  // Archivos que Tailwind escaneará para encontrar clases
  content: ["./*.html", "./js/**/*.js"],
  theme: {
    extend: {
      // 1. Paleta de colores coherente y profesional (tonos verdes)
      colors: {
        'primary': '#059669',     // Verde esmeralda intenso
        'primary-dark': '#047857',
        'secondary': '#10B981',   // Verde esmeralda más claro
        'accent': '#F59E0B',      // Acento complementario (ámbar)
        'dark-text': '#111827',   // Casi negro para texto principal
        'light-text': '#F9FAFB',  // Blanco roto para fondos oscuros
        'body-text': '#374151',   // Gris oscuro para párrafos
        'light-bg': '#F9FAFB',    // Fondo general muy claro
      },
      // 2. Tipografías profesionales de Google Fonts
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'display': ['Poppins', 'sans-serif'],
      },
      // Animaciones personalizadas para efectos sutiles
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(16, 185, 129, 0.7)' },
          '70%': { boxShadow: '0 0 0 12px rgba(16, 185, 129, 0)' },
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-strong': 'pulse 2s infinite',
      }
    },
  },
  plugins: [],
}