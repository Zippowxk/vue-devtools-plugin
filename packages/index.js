import VConsolePlugin from './plugin'
import be from './backend'
import {installHooks} from 'app-backend'
import injectString from './inject.txt'
installHooks(window)
let file = `<div id='app'>GeeksForGeeks</div>`
let target;
let targetWindow;
const injectOnce = once(inject);
class VConsoleVueTab extends VConsolePlugin {

  constructor(...args) {
    super(...args);
  }

  onRenderTab(cb){
    cb(`<iframe id="vue-iframe" srcdoc="${file}" style="width:100%;position:absolute;top:0;bottom:0;min-height:100%;"></iframe>`);
  }
  onReady() {
    target = document.getElementById('vue-iframe')
    targetWindow = target.contentWindow;
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
  document.getElementById('vue-iframe').contentWindow.document.write(file) 
  const script = document.getElementById('vue-iframe').contentWindow.document.createElement('script')
  script.text = scriptContent
  document.getElementById('vue-iframe').contentWindow.document.body.appendChild(script)
}

const initPlugin = function(vConsole){
  var tab = new VConsoleVueTab('vue', 'Vue');
  vConsole.addPlugin(tab);
}
export default {
  initPlugin
}
