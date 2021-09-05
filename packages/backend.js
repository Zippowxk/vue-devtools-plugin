import { initBackend } from '@back'
import { Bridge } from '@utils/bridge'
// import _ from './vue-devtools-build/backend.js'
// import __ from './vue-devtools-build/hook.js'

const initBackendWithTargetWindow = function(win,targetWindow){
  const bridge = new Bridge({
    listen (fn) {
      win.addEventListener('message', evt => {
        console.log('devtools -> backend', evt.data)
        fn(evt.data)})
    },
    send (data) {
      console.log('backend -> devtools', data)
      targetWindow.postMessage(data, '*')
    }
  })
  initBackend(bridge)
}


export default { initBackendWithTargetWindow }