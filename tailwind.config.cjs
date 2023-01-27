/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
                w_low:{...colors.yellow, DEFAULT: colors.yellow[500]},
                w_high:{...colors.lime, DEFAULT: colors.lime[500]},
                w_x:{...colors.red, DEFAULT: colors.red[500]},
                w_z:{...colors.slate, DEFAULT:colors.slate[400]},
      }
    },
  },
  plugins: [],
}
