import { initBackend } from '@back'
import { Bridge } from '@utils/bridge'

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