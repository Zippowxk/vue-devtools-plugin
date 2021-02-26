import Vue from 'vue'
import App from './App.vue'
import VConsole from 'vconsole'
const vc = new VConsole();
import vvp from 'vue-vconsole-plugin'
import {findInstanceOrVnode} from 'app-backend'
console.log(findInstanceOrVnode);

vvp.initPlugin(vc);
window.vc = vc;
Vue.config.productionTip = false
new Vue({
  render: h => h(App),
}).$mount('#app')
