const pkg = require("./package.json");
const Path = require("path");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  mode: "production",
  // mode: "development",
  devtool: false,
  entry: {
    vue_plugin: Path.resolve(__dirname, "./packages/index.js")
    // inject: Path.resolve(__dirname, './packages/inject.js')
  },
  // experiments: {
  //   outputModule: true,
  // },
  output: {
    path: Path.resolve(__dirname, "./dist"),
    filename: "[name].js",
    library: "vueVconsoleDevtools",
    libraryTarget: "umd",
    umdNamedDefine: true,
    // path: Path.resolve(__dirname, "./dist"),
    // filename: "vue.devtools.vconsole.js",
    // module: true,
  },
  externals:['vue'],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["babel-loader"],
      },
      {
        test: /\.txt$/,
        use: ["raw-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'eslint-loader',
        options: {
          // eslint options (if necessary)
        },
      },
    ],
  },
  plugins: [],
  optimization: {
    // 1. 这个配置必须
    minimizer: [
      new TerserPlugin({
        // 压缩js
        cache: true,
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true, //传true就是干掉所有的console.*这些函数的调用.
            drop_debugger: true, //干掉那些debugger;
          },
        },
      }),
    ],
  },
  devtool: "source-map", // 2. 这个配置必须
  resolve: {
    extensions: [".js", ".vue"],
    alias: {
      "@front": "app-frontend/src",
      "@back": "app-backend/src",
      "@utils": "shared-utils/src",
    },
    symlinks: false,
  },
};
