// import _ from './debug/backend.js'
// import __ from './debug/hook.js'
// window.__VUE_PROD_DEVTOOLS__ = true
import VConsole from "vconsole";
// import { initPlugin } from './debug/vue_plugin.js'
import Devtools from './debug/vue_plugin.js'
// import { createApp } from './debug/vue.esm-bundler.js'
import { createApp } from 'vue/dist/vue.esm-bundler.js'
// import Vue from 'vue/dist/vue.cjs.js'
// import Vue from 'vue/dist/vue.global.js'
// const Vue = require('vue/dist/vue.global.js')
import App from './App.vue'
// console.log(_,__)
// debugger
// import Devtools from 'vue-vconsole-devtools'
// Vue.devtools = true;
// window.__FEATURE_PROD_DEVTOOLS__ = true
// const devt = {
// 	install(app) {
// 		if (process.env.NODE_ENV === 'development' && window.__VUE_DEVTOOLS_GLOBAL_HOOK__) {
//       console.log('====================================');
//       console.log(app);
//       window.app = app
//       console.log('====================================');
//       app.config.devtools = true
//       // debugger
// 			// window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit("init",app.constructor)
// 		}
// 	},
// };
Devtools.initPlugin(new VConsole());
// console.log("!!!!!!!!");
// console.log(Vue)
// window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('init', Vue)


createApp(App).mount('#app')
// createApp(App).use(devt).mount('#app')
// 
// app['config'] = {devtools: true}

// setTimeout(() => {
//   if ('__VUE_DEVTOOLS_GLOBAL_HOOK__' in window) {
//     window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit("app:init",app,'xx.xx',"type-m")
// }
// }, 0);


