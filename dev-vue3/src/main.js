import VConsole from "vconsole";
import Devtools from './debug/vue_plugin.js'
import {createApp} from './debug/vue.esm-bundler.js'
import App from './App.vue'
// import Devtools from 'vue-vconsole-devtools'
// Vue.devtools = true;
Devtools.initPlugin(new VConsole());
setTimeout(() => {
const app = createApp(App).mount('#app')
}, 3000);
setTimeout(() => {
  if ('__VUE_DEVTOOLS_GLOBAL_HOOK__' in window) {
    // window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit("init",app)
}
}, 0);
