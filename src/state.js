import { observe } from "./observer/index";
import { nextTick, isPlainObject, noop } from "./util/index";
import Watcher from "./observer/watcher";

export function initState(vm) {
  let opts = vm.$options;

  // opts {el: '#app', data: {…}, props: {…}, watch: {…}}
  if (opts.props) {
    initProps();
  }

  if (opts.data) {
    initData(vm);
  }

  if (opts.methods) {
    initMethods(vm);
  }

  if (opts.watch) {
    initWatch(vm);
  }

  if (opts.computed) {
    initComputed();
  }

 
}

function initProps() {}

// 对data初始化
// 1、data的值 是对象 2、data的值是函数
function initData(vm) {
  let data = vm.$options.data;
  // console.log('---对data初始化----', data);
  // data的值是函数this指向
  // _data 只是为了方便检测
  data = vm._data = typeof data === "function" ? data.call(vm) : data;
  
  // 处理代理 将data的所有属性 代理到实例上
  for (let key in data) {
    proxy(vm, key);
  }

  // 对data进行劫持
  observe(data);

}

function initComputed() {}

function initMethods(vm) {
  // 将options 配置项上的methods 代理到vm实例上
  const methods = vm.$options.methods;
  if (methods) {
    for (const key in methods) {
      vm[key] = methods[key] == null ? noop : methods[key];
    }
  }
}


function initWatch(vm) {
  const watch = vm.$options.watch;
  // { message: ƒ (newVal, oldVal), todo: {immediate: true, dep: true, handler: ƒ}
  if (watch) {
    for (const key in watch) {
      const handler = watch[key];
      // handler 分情况处理：数组、字符串、对象、方法
      // console.table(key, handler)
      if (Array.isArray(handler)) {
        for (let i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        // handler 字符串、对象、方法
        createWatcher(vm, key, handler);
      }
    }
  }
}

function createWatcher(vm, key, handler) {
  // vm message ƒ (newVal, oldVal)
  // vm todo    {immediate: true, dep: true, handler: ƒ}

  // vm.$watch 随时监听 随时取消
  // vm.$watch(key, handler, { deep: true })
  let options;

  // 对象
  if (isPlainObject(handler)) {
    // options  {immediate: true, dep: true, handler: ƒ}
    options = handler;
    // console.log('handler', handler)
    // handler f(newVal, oldVal) {}
    handler = handler.handler;
    // console.log('options', options);
  }
  // 字符串
  if (typeof handler === 'string') {
    // console.log('handler', handler);
    handler = vm.$options.methods[handler];

    // handler = vm[handler];
  }
  // 方法 handler不变

  vm.$watch(key, handler, options);
}

export function stateMixin(Vue) {
  /**
   * 作用：数据更新后获取最新dom
   * 队列处理
   * 就是将用户的callback 和 vue异步处理的更新操作 合并
   * @param {*} cb 
   */
  Vue.prototype.$nextTick = function(cb) {
    nextTick(cb);
  }

  /**
   * 监听属性 可以做到随时监听 随时取消
   * @param {*} expOrFn 
   * @param {*} cb 
   * @param {*} options 
   */
  Vue.prototype.$watch = function(expOrFn, cb, options) {
    // console.log('expOrFn, cb, options: ', expOrFn, cb, options);
    // todo ƒ handler(newVal, oldVal){} {immediate: true}

    // watch 就是在数组改变后执行callback，而Watcher类就是在数据更新执行vm._update(vm._render()) 执行的callback不一样而已
    // 即 渲染的时走的是渲染Watcher，$watch的时走的是另外的Watcher 使用user参数标识
    const vm = this;
    
    options = options || {};
    options.user = true;

    // $watch expOrFn这不是函数 是key(todo、message)
    const watcher = new Watcher(vm, expOrFn, cb, options);

    // watcher中保存了 第一次的值
    if (options && options.immediate) {
      cb.call(vm, watcher.value);
    }
  }
  
}


function proxy(vm, key) {
  Object.defineProperty(vm, key, {
    configurable: true,
    enumerable: true,
    get() {
      return vm._data[key];
    },
    set(val) {
      vm._data[key] = val;
    }
  })
}
