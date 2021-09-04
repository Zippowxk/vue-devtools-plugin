import {createApp} from 'vue/dist/vue.esm-bundler.js'
import App from './App.vue'
import VConsole from "vconsole";
// import Devtools from 'vue-vconsole-devtools'
import Devtools from './debug/vue_plugin.js'
// Vue.devtools = true;
createApp(App).mount('#app')
setTimeout(() => {
  Devtools.initPlugin(new VConsole());
}, 3000);
