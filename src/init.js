import { initState } from "./state";
import { compileToFunctions } from "./compiler/index";
import { mountComponent, callHook } from "./lifecycle";
import { mergeOptions } from "./util/index";

export function initMixin(Vue) {

  Vue.prototype._init = function(options) {
    // options {el: '#app', data: {…}, props: {…}, watch: {…}}
    let vm = this;

    // Vue.options 是Vue全局定义的一些方法 都会合并到Vue.options中Vue.mixins
    vm.$options = mergeOptions(Vue.options, options);

    callHook(vm, 'beforeCreate')

    // 初始化状态
    initState(vm);

    // console.log('----初始化状态----\n\n', vm, '\n\n');

    callHook(vm, 'created')

    // vue初次渲染 ——> 先初始化数据 ——> 将模版进行编译 ——> 变成render()函数 ——> 生成虚拟节点 ——> 变成真实DOM ——> 渲染到页面
    // vue模版编译 template、render、el(el必须要有, 因为要知道模版编译完渲染到什么地方去)

    // 模版编译
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }

  }

  Vue.prototype.$mount = function(el) {
    el = el && document.querySelector(el);
    // 这里的el 实际上就是旧的dom, 后面需要跟生成新的vnode 进行比较
    // console.log('--模版编译---', el, typeof el);
    const vm = this;
    vm.$el = el;
    const options = vm.$options;


    // 在没有编写render函数的情况下 获取template编译
    if (!options.render) {
      let template = options.template;
      if (template) {
        // console.log('template')
      } else {
        // 没有render、template则获取el的outerhTML
        template = el.outerHTML;

        // typeof template === string
      }

      // console.log('template, ', template, typeof template)
      // 1、获取模板template <div id="app" title="root">hello {{ message }}</div>
      // 2、转化成ast语法树
      // 3、ast语法树转化成render字符串
      // 4、render字符串转化成render() 函数
      // 5、转化成vnode

      /**
       * ast语法树
       * 
       * {
       *   tag: 'div',
       *   attrs: [
       *     { name: 'id', value: 'app' },
       *     { name: 'title', value: 'root' },
       *     .....
       *   ],
       *   children: [
       *     { tag: '', text: 'hello' },
       *     { tag: 'h1', ... }
       *   ]
       * }
       */
       const render = compileToFunctions(template);
       options.render = render;
    }

    // 挂载组件
    // mountComponent(vm, el);
    vm._mount(vm, el);
    
  }


}

