// import Vue from 'vue'
// import DevIframe from './DevIframe.vue'
import { Bridge } from '@vue-devtools/shared-utils'
import { initDevTools } from '@front'

const target = document.getElementById('target')
const targetWindow = target.contentWindow

// 1. load user app
target.src = './target.html'
target.onload = () => {
  // 2. init devtools
  initDevTools({
    connect (cb) {
      // 3. called by devtools: inject backend
      inject('./target/backend.js', () => {
        // 4. send back bridge
        cb(new Bridge({
          listen (fn) {
            targetWindow.parent.addEventListener('message', evt => fn(evt.data))
          },
          send (data) {
            // console.log('devtools -> backend', data)
            targetWindow.postMessage(data, '*')
          }
        }))
      })
    },
    onReload (reloadFn) {
      target.onload = reloadFn
    }
  })
}

function inject (src, done) {
  if (!src || src === 'false') {
    return done()
  }
  const script = target.contentDocument.createElement('script')
  script.src = src
  script.onload = done
  target.contentDocument.body.appendChild(script)
}
