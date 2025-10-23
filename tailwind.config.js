/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Medical Blue (Primary)
        primary: {
          DEFAULT: 'hsl(210, 95%, 51%)',  // #0D7FFF
          light: 'hsl(210, 95%, 85%)',    // #B3D9FF
          dark: 'hsl(210, 95%, 35%)',     // #0356B3
          foreground: 'hsl(0, 0%, 100%)', // White
        },
        // Health Green (Secondary)
        health: {
          DEFAULT: 'hsl(145, 85%, 47%)',  // #13C57B
          light: 'hsl(145, 85%, 90%)',    // #C2F5E0
        },
        secondary: {
          DEFAULT: 'hsl(150, 45%, 96%)',  // #F0F9F5
          foreground: 'hsl(150, 45%, 25%)', // #234D3A
        },
        // Alert Colors
        destructive: {
          DEFAULT: 'hsl(0, 84%, 60%)',    // #ED3939
          foreground: 'hsl(0, 0%, 100%)', // White
        },
        warning: {
          DEFAULT: 'hsl(45, 93%, 47%)',   // #F5A623
          foreground: 'hsl(45, 93%, 10%)', // #1A1300
        },
        // Neutral Colors - Light Mode
        background: 'hsl(210, 30%, 98%)', // #F8FAFB
        foreground: 'hsl(215, 25%, 16%)', // #1F2937
        muted: {
          DEFAULT: 'hsl(210, 20%, 70%)',  // #F3F5F7
          foreground: 'hsl(215, 20%, 40%)', // #52667A
        },
        border: 'hsl(215, 20%, 88%)',     // #D9DFE5

        // Dark Mode Colors
        dark: {
          background: 'hsl(215, 28%, 12%)',    // #171D2A - Azul escuro médico
          foreground: 'hsl(210, 20%, 95%)',    // #F1F3F5 - Texto claro
          muted: {
            DEFAULT: 'hsl(215, 25%, 30%)',     // #232B3D - Cinza azulado
            foreground: 'hsl(215, 15%, 65%)',  // #939DAE - Texto secundário
          },
          border: 'hsl(215, 25%, 25%)',        // #303847 - Bordas sutis
          card: 'hsl(215, 27%, 15%)',          // #1E2433 - Cards/containers
        },
      },
    },
  },
  plugins: [],
}