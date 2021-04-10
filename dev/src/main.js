import Vue from "vue";
import App from "./App.vue";
// import VConsole from "vconsole";
// import Devtools from 'vue-vconsole-devtools'
Vue.config.devtools = true;

// Devtools.initPlugin(new VConsole());
new Vue({
  render: (h) => h(App),
}).$mount("#app");

const app = new Vue({
  render: (h) => h(App),
}).$mount("#app");

if(process.env.NODE_ENV === "development"){
  Promise.all([import("vconsole"), import("vue-vconsole-devtools")]).then(
    (res) => {
      if (res.length === 2) {
        window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue = app.constructor;
        const VConsole = res[0].default;
        const Devtools = res[1].default;
        Devtools.initPlugin(new VConsole());
      }
    }
  );
}
