import Vue from "vue";
import App from "./App.vue";
import eruda from 'eruda' // 引入工具包
eruda.init() // 初始化
import Devtools from '../../packages/dist/vue_plugin.js'
// import VConsole from "vconsole";
// import Devtools from 'vue-vconsole-devtools'

// import Devtools from 'vue-vconsole-devtools'
// Vue.config.devtools = true;
// Devtools.initPlugin(new VConsole());
window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit('init', Vue)
// Devtools.initPlugin(new VConsole());
console.log(process)
Devtools.initPlugin(eruda)

new Vue({
  render: (h) => h(App),
}).$mount("#app");

// if(process.env.NODE_ENV === "development"){
//   Promise.all([import("vconsole"), import("./debug/vue_plugin.js")]).then(
//     (res) => {
//       if (res.length === 2) {
//         Vue.config.devtools = true;
//         window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit("init",Vue)
//         const VConsole = res[0].default;
//         const Devtools = res[1].default;
//         Devtools.initPlugin(new VConsole());
//       }
//     }
//   );
// }
