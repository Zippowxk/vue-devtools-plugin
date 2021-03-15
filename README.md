**# Vue-vConsole-devtools**

`Vue-vConsole-devtools` 是一款`vConsole`插件，把`Vue.js`官方调试工具`vue-devtools`移植到移动端，可以直接在移动端查看调试`Vue.js`应用







**### 为什么需要本插件：**

1. 在Safari和移动端无法直接调试
2. Electron版本的devtools安装和远程调试配置非常麻烦

**### 功能**

1. 移植了官方Vue-devtools的全部功能
2. 针对移动端优化了部分操作方式

**### 使用方式**

1. ```npm i -s vue-vconsole-devtools```

2. 在工程中入口文件 （如`src/main.js`）

```javascript
...
import VConsole from "vconsole";
import Devtools from 'vue-vconsole-devtools'
Devtools.initPlugin(new VConsole());
...
```

**### 高级用法**

1. 只在开发环境下引入

   ```javascript
   if (process.env.NODE_ENV !== 'production') {
     Promise.all([import(/* webpackChunkName: 'vconsole' */ 'vconsole'), import(/* webpackChunkName: 'devtools' */ 'vue-vconsole-devtools')])
       .then(values => {
         if (values.length === 2) {
           const VConsole = values[0].default
           const Devtools = values[1].default
           Devtools.initPlugin(new VConsole())
         }
       })
       .catch(err => console.error(err))
   }
   ```

   

**### 更新日志**

**#### v0.0.3**

1. 优化了打包体积

**### TODO:**

1. 支持Vue.js 3
2. 开发脱离vConsole版本

**### Sample code**

https://github.com/Zippowxk/vue-router-helper-demo)



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