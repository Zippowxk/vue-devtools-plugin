import { initBackend } from '@back'
import Bridge from '@utils/bridge'

const initBackendWithTargetWindow = function(win,targetWindow){
  const bridge = new Bridge({
    listen (fn) {
      win.addEventListener('message', evt => {
        fn(evt.data)})
    },
    send (data) {
      targetWindow.postMessage(data, '*')
    }
  })
  
  initBackend(bridge)
}


export default { initBackendWithTargetWindow }