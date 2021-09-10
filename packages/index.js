import VConsolePlugin from './plugin'
import be from './backend'
import injectString from './inject.txt'
// import hookString from './hook.txt'
import { installHook } from '@back/hook'
// require('@back/hook')
// require('@back')
installHook(window)
// injectHook(hookString)
// let file = `<div id='app'>GeeksForGeeks</div>`
let target;
let targetWindow;
const injectOnce = once(inject);
class VConsoleVueTab extends VConsolePlugin {

  constructor(...args) {
    super(...args);
  }

  onRenderTab(cb){
    cb(`<iframe id="vue-iframe" style="width:100%;position:absolute;top:0;bottom:0;min-height:100%;"></iframe>`);
  }
  onReady() {
    target = document.getElementById('vue-iframe')
    targetWindow = target.contentWindow;
    target.__vdevtools__injected = true
    be.initBackendWithTargetWindow(window,targetWindow);
  }

  onAddTopBar(callback) {
  }

  onAddTool(callback) {
  }

  onShow() {    
    injectOnce(injectString)
  }

} // END Class

function once(fn){
  let loaded = false;
  return function(){
    if(!loaded){
      fn.apply({},arguments)
      loaded = true;
    }
  }
}

function inject (scriptContent, done) {
  const div = document.getElementById('vue-iframe').contentWindow.document.createElement("div") 
  div.setAttribute("id","app")
  document.getElementById('vue-iframe').contentWindow.document.body.appendChild(div)

  const script = document.getElementById('vue-iframe').contentWindow.document.createElement('script')
  script.text = scriptContent
  document.getElementById('vue-iframe').contentWindow.document.body.appendChild(script)
}

export const initPlugin = function(vConsole){
  var tab = new VConsoleVueTab('vue', 'Vue');
  vConsole.addPlugin(tab);
}



// function injectHook (injectContent) {
//   const script = window.document.createElement('script')
//   script.text = injectContent
//   window.document.body.appendChild(script)
// }


// Object.defineProperty(window,'process',{
//   get(){
//     return {platform:'browers'}
//   },
//   configurable: false
// })
export default {
  initPlugin
}
