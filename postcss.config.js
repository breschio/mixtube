/** @type {import('postcss').Config} */
module.exports = {
  plugins: {
    'tailwindcss': {
      config: './tailwind.config.ts'
    },
    'autoprefixer': {},
  }
}