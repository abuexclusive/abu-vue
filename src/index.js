import { initMixin } from './init';
import { lifeCycleMixin } from './lifecycle';
import { renderMixin } from './vnode/index';
import { initGlobalAPI } from './global-api/index';
import { stateMixin } from './state';
import { compileToFunctions } from './compiler/index';
import { createElm, patch} from './vnode/patch';

function Vue(options) {

  // 初始化
  this._init(options);

  /**
   * 
   * 1、初始化  包括props、data、watch、computed、methods等
   * （1）、data里面主要完成对数据的劫持
   * （2）、props......
   * 
   * 
   * 2、模板编译
   * （1）、获取模版 template
   * （2）、模版转化为ast语法树 （对template string使用while截取 分为开始标签、文本、结束标签 三大部分，使用栈的结构确定ast节点的父子关系）
   * （3）、ast语法树转化为render字符串（_c、_v、_s函数）
   * （4）、render字符串转化为render函数 new Function()、with语法
   * （5）、将render函数挂在Vue实例的$options属性上
   * 
   * 
   * 3、挂载组件
   * （1）、根据render函数生成vnode (此过程主要由vm._render方法实现)，render函数转化为vnode的过程中 已经解析了vm的一些变量
   * （2）、将vnode转化成真实dom渲染到页面（此过程主要由vm._update方法实现）
   * 
   */
}

/**
 * 提供 初始化状态、模版编译方法
 *  _init、$mount
 */
initMixin(Vue);

/**
 * 提供 render函数转化为vnode方法 
 * _render、_c、_v、_s
 */
renderMixin(Vue);

/**
 * 提供 vnode转化真实dom 挂载方法 
 * _update
 */
lifeCycleMixin(Vue);

stateMixin(Vue);

// Vue全局函数 静态方法定义  
// Vue.mixin  Vue.extend  Vue.use  Vue.component
initGlobalAPI(Vue)





// const vm1 = new Vue({
//   data: { name: 'react'}
// })
// const render1 = compileToFunctions(`<div id='app' style="color: red"></div>`);
// const vnode1 = render1.call(vm1);
// document.body.appendChild(createElm(vnode1));

// const vm2 = new Vue({
//   data: { name: 'vue'}
// })
// const render2 = compileToFunctions(`<div id='root' style="color: red">{{ name }}</div>`);
// const vnode2 = render2.call(vm2);

const vm1 = new Vue({
  data: { name: 'react'}
})
const render1 = compileToFunctions(`<ul><li style="background: pink" key='b'>b</li><li style="background: yellow" key='d'>d</li><li style="background: red" key='a'>a</li><li style="background: blue" key='c'>c</li></ul>`);
const vnode1 = render1.call(vm1);
document.body.appendChild(createElm(vnode1));

const vm2 = new Vue({
  data: { name: 'vue'}
})
const render2 = compileToFunctions(`<ul><li style="background: red" key='a'>a</li><li style="background: pink" key='b'>b</li><li style="background: blue" key='c'>c</li><li style="background: yellow" key='d'>d</li></ul>`);
const vnode2 = render2.call(vm2);

setTimeout(() => {
  patch(vnode1, vnode2);
}, 4000)


export default Vue;