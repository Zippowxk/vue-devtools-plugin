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
 // END Class

function once(fn){
  let loaded = false;
  return function(){
    if(!loaded){
      fn.apply({},arguments)
      loaded = true;
    }
  }
}

let contentWindow;

function inject (scriptContent, done) {
  const div = contentWindow.document.createElement("div") 
  div.setAttribute("id","app")
  contentWindow.document.body.appendChild(div)

  const script = contentWindow.document.createElement('script')
  script.text = scriptContent
  contentWindow.document.body.appendChild(script)
}

export const initPlugin = function(eruda){

  eruda.add(function (eruda) {
    // eruda.Tool implements those four methods.
    class ErudaVue extends eruda.Tool {

      constructor() {
        super()
        this.name = 'Vue';
        this.style = eruda.util.evalCss('.eruda-test { background: #000; }');
      }
      init($el) {
        $el.html(`<iframe id="vue-iframe" style="width:100%;position:absolute;top:0;bottom:0;min-height:100%;"></iframe>`);
        super.init($el);        
        let vi = $el[0].querySelector('#vue-iframe')
        vi.__vdevtools__injected = true
        contentWindow = vi.contentWindow
        be.initBackendWithTargetWindow(window,contentWindow); 
        injectOnce(injectString)
      }
    
      // show($el) {    
      //   super.show($el);
      // }

    }
    return new ErudaVue();
});

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
