const Visualizer = require('webpack-visualizer-plugin');

module.exports = {
  publicPath: '/',
  configureWebpack: {
    plugins: [
      new Visualizer({ filename: './statistics.html' }),
    ],
    resolve: {
      // keep symlinked packages (the @phila/vue-datafetch junction for local dev)
      // resolving their imports from this app's node_modules
      symlinks: false,
    },
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
    'jspdf-autotable',
    // /other-dep/
  ],
};
