import { pushTarget, popTarget } from "./dep";
import { nextTick, parsePath } from "../util/index";


/**
 * 观察者
 * 
 * 1、通过Watcher实现更新
 * 
 */

// 每个组件只有一个watcher 区分不同的watcher
 let uid = 0;
export default class Watcher {
  constructor(vm, expOrFn, cb, options) {
    this.vm = vm;
    this.expOrFn = expOrFn;
    this.cb = cb;
    this.options = options;
    this.user = !!options.user;
    this.id = ++uid;
    // 存放dep
    this.deps = [];
    this.depIds = new Set();

    // 1、expOrFn 实际就是 vm._update(vm._render());
    // vm._render render函数重新获取data 转化成vnode
    // vm._update vnode 转化成真是dom

    // 2、expOrFn 是字符串key $watch expOrFn这不是函数 是key(todo、message)
    if (typeof expOrFn == 'function') {
      this.getter = expOrFn;
    } else {
      
      // console.log(expOrFn)
      // $watch expOrFn message、to.a.b.c(深度监听)

      // this.getter 就是根据传入的字符串 获取 vm实例上的属性值
      // this.getter = parsePath(expOrFn);

      
      this.getter = function() {
        const segments = expOrFn.split('.');
        let obj = vm;
        for(let i = 0; i < segments.length; i++) {
          const key = segments[i];
          obj = obj[key];
        }
        return obj;
      }

      // console.log(expOrFn, this.getter(), 777)

    }

    // 初始化时
    // 保存$watche对应的旧值
    this.value = this.get();
    // console.log('旧值: ', this.value)
  }

  /**
   * 初始化时 渲染视图
   */
  get() {

    // Dep target添加 watcher
    pushTarget(this);

    // vm._update(vm._render())
    // f() {} 获取data值函数
    const value = this.getter();

    // Dep target添加 watcher
    popTarget();

    return value;

  }

  /**
   * watcher 更新时执行
   */
  run() {
    
    const value = this.get();
    // 数据更新了 这里的value 就是新值
    // console.log('新值: ', value);
    const oldValue = this.value;
    this.value = value;

    if (this.user) {
      // 表示是watch的更新
      this.cb.call(this.vm, value, oldValue);
    }
  }

  /**
   * 更新
   * 
   * 数据更新多次 vm._update(vm._render()) 执行多次，但是要求只执行一次
   * 需要批量处理 vue解决方案 异步处理 数据更新后不会马上执行渲染
   */
  update() {
    
    // this.get();
    // 更新几次数据 update方法就会执行几次 这里是三次（message、todo、outline）
    // 注意：不要数据更新后 每次都调用get方法 
    queueWatcher(this);
  }

  addDep(dep) {
    // 1、去重
    const id = dep.id;
    if (!this.depIds.has(id)) {
      this.deps.push(dep);
      this.depIds.add(id);

      // 2、 dep 存放watcher
      dep.addSub(this);
    }
  }


}

// 把被触发的watcher，存放到队列中
let queue = [];
let has = {};
let flushing = false;

function queueWatcher(watcher) {
  // 一个组件对应一个watcher 就是说如果组件相同watcher是同一个
  // console.log('----触发的watcher----', watcher)
  const id = watcher.id;
  // 去掉重复的watcher 如果同一个watcher被多次触发，只会被推入到队列中一次
  if (has[id] == null) {
    
    // 先把watcher加入到队列中 然后再执行更新的时候异步
    queue.push(watcher);
    has[id] = true;

    // 防抖：用户多次触发 只会触发一次 
    if (!flushing) {
      // 第一次进来，第二次flushing为true进不来
      // 异步 同步代码继续向下执行
      // setTimeout(() => {
      //   // 添加进来的watcher再异步调用更新
      //   for (let index = 0; index < queue.length; index++) {
      //     const watcher = queue[index];
      //     watcher.run();
      //   }
      //   queue = [];
      //   has = {};
      //   flushing = false;
      // }, 0)

      // 使用nextTick优化setTimeout
      nextTick(flushSchedulerQueue);

    }
    flushing = true;
  }
}

function flushSchedulerQueue() {
  for (let index = 0; index < queue.length; index++) {
    const watcher = queue[index];
    watcher.run();
    // 执行生命周期
    if (!watcher.user) {
      watcher.cb();
    }
    
  }
  queue = [];
  has = {};
  flushing = false;
}



/**
 * 收集依赖
 * 
 * dep: dep和data中的属性是一一对应的
 * watcher: data中的属性 在视图上用了几个 就有几个watcher
 * 
 * 每个组件只有一个watcher
 * 
 * dep和watcher 是多对多的关系, dep里面保存watcher,watcher里面也要保存dep
 */