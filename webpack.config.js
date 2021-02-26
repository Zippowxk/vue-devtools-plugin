const pkg = require('./package.json');
const Path = require('path');

module.exports = {
  mode: 'production',
  devtool: false,
  entry: {
    vue_plugin : Path.resolve(__dirname, './packages/index.js'),
    inject: Path.resolve(__dirname, './packages/inject.js')
  },
  output: {
    path: Path.resolve(__dirname, './dev/public/js'),
    filename: '[name].min.js',
    library: 'vue-vconsole-devtools',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      { 
        test: /\.js$/, use:['babel-loader']
      },
    ]
  },
  plugins: [
  ],
  optimization: {    // 1. 这个配置必须
    minimize: false
  },
  devtool: "source-map", // 2. 这个配置必须
  resolve: {
    alias: {
      "@back/*": Path.resolve(__dirname, "./vue-devtools/app-backend/src/*"),
      "@front/*": Path.resolve(__dirname, "./vue-devtools/app-frontend/src/*"),
      "@utils/*": Path.resolve(__dirname, "./vue-devtools/shared-utils/src/*"),
      "@moduleb": Path.resolve(__dirname, "./module-b/mb/")
    }
  }
};