export default {
  plugins: {
    tailwindcss: {
      config: './tailwind.config.js',

    },
    autoprefixer: {
      overrideBrowserslist: ['> 1%', 'last 2 versions'],
    },
  },
}
