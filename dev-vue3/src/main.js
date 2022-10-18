// import _ from './debug/backend.js'
// import __ from './debug/hook.js'
// window.__VUE_PROD_DEVTOOLS__ = true
// import VConsole from "vconsole";
// import { initPlugin } from './debug/vue_plugin.js'
// import Devtools from './debug/vue_plugin.js'
import { createApp } from './debug/vue.esm-bundler.js'
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
// Devtools.initPlugin(new VConsole());
// console.log("!!!!!!!!");
// console.log(Vue)
// window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('init', Vue)

import eruda from 'eruda' // 引入工具包
import Devtools from '../../packages/dist/vue_plugin.js'

// setTimeout(()=> {
//   window.__VUE_DEVTOOLS_GLOBAL_HOOK__.enabled = true
// }, 500)
// import VConsole from "vconsole";
// import Devtools from 'vue-vconsole-devtools'

// Devtools.initPlugin(new VConsole());


// window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = App.constructor;

const app = createApp(App)

app.mount('#app')

eruda.init() // 初始化
// Devtools.initPlugin(eruda)
setTimeout(() => {
  Devtools.initPlugin(eruda)
}, 5000);
// 
app['config'] = {devtools: true}

// setTimeout(() => {
//   if ('__VUE_DEVTOOLS_GLOBAL_HOOK__' in window) {
//     window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit("app:init",app,'xx.xx',"type-m")
// }
// }, 0);


