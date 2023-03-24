/**
 * 发布者
 * 
 * 1、收集依赖，添加观察者（watcher）
 * 2、通知所有观察者更新视图 
 * 
 * 比如data中的message视图中可能用到用到很多地方 就会把watcher用数组收集起来
 * dep.message = [watcher1、watcher2]
 */

let uid = 0;
export default class Dep {
  constructor(key, value) {
    // 保存watcher
    this.subs = [];
    this.key = key;
    this.value = value;
    this.id = uid++;
  }


  /**
   * 收集watcher
   */
  depend() {
    // 这个方法有两个功能
    // 1、watcher保存了dep
    // 2、内部调用的dep的addSub方法  dep 保存了watcher
    Dep.target.addDep(this);
  }

  addSub(wather) {
    // dep 存放watcher
    this.subs.push(wather);

  }


  /**
   * 通知所有观察者
   */
  notify() {
    this.subs.forEach(watcher => {
      // 更新视图 实际调用的方法还是 vm._update(vm._render())
      watcher.update();
    });
  }
}

Dep.target = null;
export function pushTarget(watcher) {
  Dep.target = watcher;
}

export function popTarget() {
  Dep.target = null;
}


/**
 * 数组收集依赖
 * 
 * 1、给所有对象类型增加一个dep （Observer对象添加dep属性）
 * 2、获取数组的值 会调用get方法 让数组记住这个渲染的watcher (const childDep = observe(value);  childDep.dep.depend() )
 *  2.1、获取当前dep
 *  2.2、当对数组取值时，就让数组的dep记住watcher
 * 3、当更新数组的时候 push pop，找到watcher更新
 */