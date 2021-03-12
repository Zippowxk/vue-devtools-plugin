import VConsole from "vconsole";
import Devtools from 'vue-vconsole-devtools'
import Vue from "vue";
import App from "./App.vue";
const vc = new VConsole();
Devtools.initPlugin(vc);
Vue.config.productionTip = false;
new Vue({
  render: (h) => h(App),
}).$mount("#app");
