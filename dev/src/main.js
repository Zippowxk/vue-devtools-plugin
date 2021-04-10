import Vue from "vue";
import App from "./App.vue";
// import VConsole from "vconsole";
// import Devtools from 'vue-vconsole-devtools'

// Devtools.initPlugin(new VConsole());
new Vue({
  render: (h) => h(App),
}).$mount("#app");

if(process.env.NODE_ENV === "development"){
  Promise.all([import("vconsole"), import("vue-vconsole-devtools")]).then(
    (res) => {
      if (res.length === 2) {
        Vue.config.devtools = true;
        window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit("init",Vue)
        const VConsole = res[0].default;
        const Devtools = res[1].default;
        Devtools.initPlugin(new VConsole());
      }
    }
  );
}
