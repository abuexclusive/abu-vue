const callbacks = [];
let pending = false;
let timerFunc;

// 检测函数 toString 之后的字符串中是否带有 native code 片段
// toString 是 Function 的一个实例方法
// 如果是浏览器内置函数调用实例方法 toString 返回的结果是function Promise() { [native code] }。
function isNative(Ctor) {
  return /native code/.test(Ctor.toString())
}

function nextTickHandler() {
  for (let index = 0; index < callbacks.length; index++) {
    const cb = callbacks[index];
    cb();
  }
  pending = false;
}

if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve();
  timerFunc = () => {
    p.then(nextTickHandler)
  }
} else if (typeof MutationObserver !== 'undefined' && isNative(MutationObserver)) {
  // MutationObserver 其功能是监听dom节点的变动，在所有 dom 变动完成后，执行回调函数
  // 具体可以监听 子元素的变动 属性的变动 节点内容或节点文本的变动 所有下属节点（包括子节点和子节点的子节点）的变动
  const observer = new MutationObserver(nextTickHandler);
  const textNode = document.createTextNode(1);
  // 观测文本变化
  observer.observe(textNode, { characterData: true })
  // 执行完成 就会执行nextTickHandler
  timerFunc = () => { textNode.data = 2 };
} else {
  timerFunc = () => {
    setTimeout(nextTickHandler, 0);
  };
}

export function nextTick(cb) {

  // 这里会有两个cb 
  // 一个是 flushSchedulerQueue vue处理异步更新的 cb1
  // 一个是 用户在vue.$nextTick中的callback cb2

  // 队列 [cb1, cb2]

  callbacks.push(cb);
  if (!pending) {
    // 1、异步方法 未处理兼容
    // setTimeout(nextTickHandler, 0)

    // 2、timerFunc 异步方法 处理兼容问题 
    // vue的降级策略
    // 队列控制的最佳选择是microtask，而microtask的最佳选择是Promise.then，如果当前环境不支持Promise，MutatioObserver，vue就不得不降级为macrotask来做队列控制了。
    // （micro-task）promise -> MutationObserver ->（macro-task） setTimeout
    timerFunc();
    pending = true;
  }

}

/**
 * 事件循环
 * 
 * js引擎遇到一个异步事件后并不会一直等待其返回结果，而是会将这个事件挂起，继续执行执行栈中的其他任务。
 * 当一个异步事件返回结果后，js会将这个事件加入与当前执行栈不同的另一个队列，我们称之为事件队列
 * 被放入事件队列不会立刻执行其回调，而是等待当前执行栈中的所有任务都执行完毕， 主线程处于闲置状态时，主线程会去查找事件队列是否有任务。
 * 如果有，那么主线程会从中取出排在第一位的事件，并把这个事件对应的回调放入执行栈中，然后执行其中的同步代码...，如此反复，这样就形成了一个无限的循环。
 * 
 * macro-task(宏任务)：包括整体代码script，setTimeout，setInterval，setImmediate，UI rendering， I/O
 * micro-task(微任务)：Promise.then，process.nextTick，MutationObserver回调，MessageChannel的onmessage回调
 * 
 * 
 * 一次事件循环
 * 1、执行栈执行同步代码
 * 2、将 macro-task 里的同步代码立即执行，异步代码放入执行栈 
 * -> 调用web API 多线程执行异步事件 -> 将事件回调放入 micro-task /macro-task
 * 3、执行栈清空
 * 4、UI render（dom渲染）
 * 5、查看 micro-task 任务队列
 * -> 将 micro-task 里的任务全部 放入 执行栈中执行
 * 6、查看 macro-task 任务队列（开启下一次事件循环）
 * -> 将 macro-task 里的任务按先入先出顺序 放一个 在执行栈中执行 
 */