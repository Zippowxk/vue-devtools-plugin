const webpack = require('webpack')

module.exports = {
  chainWebpack: config => {
    config
        .plugin('define')
        .tap(args => { 
            args[0].__VUE_PROD_DEVTOOLS__ = JSON.stringify(true)
            args[0].__VUE_OPTIONS_API__ = JSON.stringify(true)
            return args
        })
  },
  // configureWebpack: config => {

  //   const plugins = []

  //   plugins.push(new webpack.DefinePlugin({
  //     __VUE_PROD_DEVTOOLS__: JSON.stringify(true)
  //   }))

  //   Object.assign(config, {
  //     plugins
  //   })
  // },
  productionSourceMap: false,
}
