const pkg = require("./package.json");
const Path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const common = {
  mode: "production",
  // mode: "development",
  devtool: false,
  externals: ['vue'],
  module: {
    rules: [
      // {
      //   test: /\.js$/,
      //   use: ["babel-loader"],
      // },
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
  plugins: [
    // new BundleAnalyzerPlugin()
  ],
  optimization: {
    // 1. 这个配置必须
    minimizer: [
      new TerserPlugin({
        // exclude: /vue-devtools/,
        terserOptions: {
          compress: {
            // turn off flags with small gains to speed up minification
            arrows: false,
            collapse_vars: false,
            comparisons: false,
            computed_props: false,
            hoist_funs: false,
            hoist_props: false,
            hoist_vars: false,
            inline: false,
            loops: false,
            negate_iife: false,
            properties: false,
            reduce_funcs: false,
            reduce_vars: false,
            switches: false,
            toplevel: false,
            typeofs: false,
            drop_console: process.env.NODE_ENV == 'production',
            // a few flags with noticable gains/speed ratio
            // numbers based on out of the box vendor bundle
            booleans: true,
            if_return: true,
            sequences: true,
            unused: true,

            // required features to drop conditional branches
            conditionals: true,
            dead_code: true,
            evaluate: true
          },
          mangle: {
            safari10: true
          }
        },
        parallel: true
      })
    ],
  },
  devtool: "source-map", // 2. 这个配置必须
  resolve: {
    extensions: [".js", ".vue"],
    alias: {
      '@front': '@vue-devtools/app-frontend/src',
      '@back': '@vue-devtools/app-backend-core/lib',
      '@utils': '@vue-devtools/shared-utils/lib',
    },
    symlinks: false,
  },
}

//build vconsole & eruda plugin both
module.exports = [
{
  entry: {
    vue_plugin: Path.resolve(__dirname, "./packages/vconsole/index.js")
  },
  output: {
    path: process.env.NODE_ENV == 'production' ? Path.resolve(__dirname, "./packages/vconsole/dist") : Path.resolve(__dirname, "./dev/src/debug/vconsole/"),
    filename: "[name].js",
    library: "vueVconsoleDevtools",
    libraryTarget: "umd",
    umdNamedDefine: true,
    globalObject: 'this',
  },
  ...common,
},
{
  entry: {
    vue_plugin: Path.resolve(__dirname, "./packages/eruda/index.js")
  },
  output: {
    path: process.env.NODE_ENV == 'production' ? Path.resolve(__dirname, "./packages/eruda/dist") : Path.resolve(__dirname, "./dev/src/debug/eruda/"),
    filename: "[name].js",
    library: "eruda_vue_devtools",
    libraryTarget: "umd",
    umdNamedDefine: true,
    globalObject: 'this',
  },
  ...common,
}]
