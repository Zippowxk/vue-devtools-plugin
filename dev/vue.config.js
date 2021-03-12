// vue.config.js
module.exports = {
  // configureWebpack: {
  //   resolve:{
  //     extensions: ['.js', '.vue'],
  //     alias: {
  //       '@front': 'app-frontend/src',
  //       '@back': 'app-backend/src',
  //       '@utils': 'shared-utils/src'
  //     },
  //     symlinks: false
  //   }, 
  // },
  chainWebpack: config => {
    config.module
      .rule('txt')
      .test(/\.txt$/)
      .use('raw-loader')
        .loader('raw-loader')
        .end()
  }
}