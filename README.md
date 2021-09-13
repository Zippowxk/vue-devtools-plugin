**# Vue-vConsole-devtools**

`Vue-vConsole-devtools` 是一款`vConsole`插件，把`Vue.js`官方调试工具`vue-devtools`移植到移动端，可以直接在移动端查看调试`Vue.js`应用

### Preview
[CodePen Sample Code for Vue2](https://codepen.io/zippowxk/pen/RwVBgmp)

[CodePen Sample Code for Vue3](https://codepen.io/zippowxk/pen/QWgpJbX)

桌面使用：

![屏幕录制2021-09-10 16.53.29.gif](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2c0f6bf40da6485f9a64b0f0d2ac4f31~tplv-k3u1fbpfcp-watermark.image)

移动端使用：

![RPReplay_Final1631267658.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/8e66c2beafc34250921c26e1cdbd618b~tplv-k3u1fbpfcp-watermark.image)
### 为什么需要本插件：

1. 在Safari和移动端无法直接调试Vue.js
2. Electron版本的devtools安装和远程调试配置非常麻烦

### 功能

1. 移植了官方Vue-devtools的全部功能
2. 针对移动端优化了部分操作方式
3. 现已支持微信端内浏览器
### 使用方式
#### NPM方式引入
1. ```npm i -s vue-vconsole-devtools```

2. 在工程中入口文件 （如`src/main.js`）

```javascript
...
import VConsole from "vconsole";
import { initPlugin } from 'vue-vconsole-devtools'
initPlugin(new VConsole()); // 需要在创建Vue根实例前调用
...
```
#### CDN方式引入

```html
<script src="https://unpkg.com/vconsole/dist/vconsole.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/vue-vconsole-devtools@1.0.5/dist/vue_plugin.js"></script>
<script>
  var vConsole = new window.VConsole();
  const Devtools = window.vueVconsoleDevtools
  Devtools.initPlugin(vConsole);
</script>
```
### 高级用法

1. 只在开发环境下引入

   ```javascript
   new Vue({
     render: (h) => h(App),
   }).$mount("#app");
   
   // 在创建跟实例以后调用， 需要借助webpack的异步模块加载能力
   if(process.env.NODE_ENV === "development"){
      Promise.all([import("vconsole"), import("vue-vconsole-devtools")]).then(
        (res) => {
          if (res.length === 2) {
            Vue.config.devtools = true;
            window.__VUE_DEVTOOLS_GLOBAL_HOOK__.emit("init",Vue)
            const VConsole = res[0].default;
            const Devtools = res[1].default;
            Devtools.initPlugin(new VConsole());
          }
        }
      );
    }
   ```
### 更新日志

#### v1.0.5
1. 兼容CDN引入，优化引入方式
2. 兼容ES6 解构运算符引入方式


#### v1.0.0
1. 重大更新，升级Vue-devtools V6
2. 兼容Vue3


#### v0.0.7
1. 重要更新，解决iOS微信端浏览器兼容性问题
2. 解决iOS阿里mPass容器兼容性问题
   
#### v0.0.3
1. 优化了打包体积

### TODO:

1. 支持Vue.js 3
2. 开发脱离vConsole版本
3. webpack plugin

**### Sample code**

[Github](https://github.com/Zippowxk/Vue-vConsole-devtools/dev)



欢迎添加微信 **OmniBug **探讨交流，Email: zippowangxinkai@gmail.com

**## Contributors ✨**

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore-start -->

<!-- markdownlint-disable -->

<table>

  <tr>

​    <td align="center"><a href="https://github.com/Zippowxk"><img src="https://avatars.githubusercontent.com/u/5326755?v=4?s=100" width="100px;" alt=""/><br /><sub><b>wangxinkai</b></sub></a><br /><a href="https://github.com/Zippowxk/vue-router-keep-alive-helper/commits?author=Zippowxk" title="Code">💻</a> <a href="https://github.com/Zippowxk/vue-router-keep-alive-helper/commits?author=Zippowxk" title="Documentation">📖</a></td>

  </tr>

</table>



<!-- markdownlint-restore -->

<!-- prettier-ignore-end -->



<!-- ALL-CONTRIBUTORS-LIST:END -->