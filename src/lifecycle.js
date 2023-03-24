import { patch } from "./vnode/patch";
import Watcher from "./observer/watcher";

export function mountComponent(vm, el) {

  // 挂载组件
  // vm._render 将render函数变为vnode
  // vm._update 将vnode转为真实dom放到页面

  callHook(vm, 'beforeMount');

  // vm._update(vm._render());
  const updateComponent = () => {
    vm._update(vm._render());
  };

  //true 表示当前watcher是用来渲染的
  const watcher = new Watcher(vm, updateComponent, () => {
    callHook(vm, 'updated');
  }, true);
  // console.log(watcher)


  callHook(vm, 'mounted');
}


export function lifeCycleMixin(Vue) {
  Vue.prototype._update = function(vnode) {
    const vm  = this;

    // 两个参数  1、旧dom  2、vnode
    vm.$el = patch(vm.$el, vnode);
    // console.log(vm)

  }

  Vue.prototype._mount = function() {
    const vm  = this;
    // 挂载组件
    // vm._render 将render函数变为vnode
    // vm._update 将vnode转为真实dom放到页面

    callHook(vm, 'beforeMount');

    // vm._update(vm._render());
    const updateComponent = () => {
      vm._update(vm._render());
    };

    //true 表示当前watcher是用来渲染的
    const watcher = new Watcher(vm, updateComponent, () => {
      callHook(vm, 'updated');
    }, true);
    // console.log(watcher)


    callHook(vm, 'mounted');
  }
}


// 调用声明周期
// callHook(vm, 'created');
export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm);
    }
  }
}


