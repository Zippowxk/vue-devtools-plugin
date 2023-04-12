// eslint-disable
import { initDevTools } from "@front";
// import { Bridge } from '@utils/bridge'
import { Bridge } from "@vue-devtools/shared-utils";

// import { installHook } from '@back/hook'

// installHook(window)

const targetWindow = window.parent;
document.body.style.overflow = "scroll";
initDevTools({
  connect(cb) {
    cb(
      new Bridge({
        listen(fn) {
          window.addEventListener("message", (evt) => {
            fn(evt.data);
          });
        },
        send(data) {
          targetWindow.postMessage(data, "*");
        },
      })
    );
  },
  onReload(reloadFn) {
    // reloadFn.call()
  },
});
