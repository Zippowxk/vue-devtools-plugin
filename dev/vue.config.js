// vue.config.js
module.exports = {
  configureWebpack: {
    resolve:{
      extensions: ['.js', '.vue'],
      alias: {
        '@front': 'app-frontend/src',
        '@back': 'app-backend/src',
        '@utils': 'shared-utils/src'
      },
      symlinks: false
    },
  }
}