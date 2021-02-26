// import Vue from 'vue'
import { initDevTools } from '@front'
import Bridge from '@utils/bridge'

const targetWindow = window.parent;

initDevTools({
  connect (cb) {
    cb(new Bridge({
      listen (fn) {
        window.addEventListener('message', evt => {
          console.log('===========master on message=========================');
          console.log(evt.data);
          console.log('====================================');
          fn(evt.data)
        })
      },
      send (data) {
        console.log('devtools -> backend!!!!!!!', data)
        targetWindow.postMessage(data, '*')
      }
    }))
  },
  onReload (reloadFn) {
    reloadFn.call();
  }
})

// let app = new Vue({
//   render: (h) => h("div",'hello world!!!!')
// }).$mount('#vue_app_devtools')