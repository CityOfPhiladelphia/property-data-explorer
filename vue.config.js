const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  publicPath: '/',
  devServer: {
    progress: false
  },
  configureWebpack: {
    plugins: [
      new Visualizer({ filename: './statistics.html' }),
    ],
  },
  chainWebpack: (config) => {
    config.plugins.delete('prefetch');
  },
  css: {
    loaderOptions: {
      sass: {
        data: `@import "@/scss/_variables.scss";
              @import "@/scss/_mixins.scss";`,
      },
    },
  },
  transpileDependencies: [
    // can be string or regex
    '@phila/vue-comps',
    '@phila/vue-mapping',
    '@phila/vue-datafetch',
    '@terraformer/arcgis',
    // /other-dep/
  ],
};
