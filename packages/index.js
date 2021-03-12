import VConsolePlugin from './plugin'
import be from './backend'
import {installHooks} from 'app-backend'
import injectString from './inject.txt'
installHooks(window)
let file = `<div id='app'>GeeksForGeeks</div>`
// let file = `<p>hello world</p>`
let target;
let targetWindow;
const injectOnce = once(inject);
let app='';
class VConsoleVueTab extends VConsolePlugin {

  constructor(...args) {
    super(...args);
  }

  onRenderTab(cb){
    // cb('<iframe id="vue-iframe" src="./devtools.html" style="width:100%;position:absolute;top:0;bottom:0;min-height:100%;"></iframe>');
    // cb('<div id="app">hello</div>');
    // cb('<iframe id="vue-iframe" style="width:100%;position:absolute;top:0;bottom:0;min-height:100%;"></iframe>');
    cb(`<iframe id="vue-iframe" srcdoc="${file}" style="width:100%;position:absolute;top:0;bottom:0;min-height:100%;"></iframe>`);
  }
  onReady() {
    target = document.getElementById('vue-iframe')
    targetWindow = target.contentWindow;
    be.initBackendWithTargetWindow(window,targetWindow);
    // do nothing
    // 引入 Vue
    // myplugin().then((res)=>{
    //   res.init();
    // })
    // mytest().then((res)=>{
    //   console.log('====================================');
    //   console.log(res);
    //   console.log('load test js done');
    // })
    
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
  const script = document.getElementById('vue-iframe').contentWindow.document.createElement('script')
  script.text = scriptContent
  // script.src = scriptContent;
  // script.onload = done
  document.getElementById('vue-iframe').contentWindow.document.body.appendChild(script)
  // console.log("injected!!!!!!!!!!!!!!!!!!");
}

const initPlugin = function(vConsole){
  var tab = new VConsoleVueTab('vue', 'Vue');
  vConsole.addPlugin(tab);
}
export default {
  initPlugin
}
