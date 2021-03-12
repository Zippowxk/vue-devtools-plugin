import { initDevTools } from '@front'
import Bridge from '@utils/bridge'

const targetWindow = window.parent;
document.body.style.overflow = "scroll";
initDevTools({
  connect (cb) {
    cb(new Bridge({
      listen (fn) {
        window.addEventListener('message', evt => {
          fn(evt.data)
        })
      },
      send (data) {
        targetWindow.postMessage(data, '*')
      }
    }))
  },
  onReload (reloadFn) {
    reloadFn.call();
  }
})