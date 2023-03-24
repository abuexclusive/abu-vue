import { arrayMethods } from './array';
import Dep from './dep';

export function observe(value) {
  // value {message: 'vue', outline: Array(3), framework: {…}}
  // 1、value是对象 2、value是数组
  // console.log('---observe----', value);
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  // typeof {} typeof [] 结果都是object
  return new Observer(value);
}


class Observer {
  constructor(value) {
    this.value = value;
    // Object.defineProperty 缺点只能对对象中的一个属性劫持，所以这里需要遍历
    // {message: 'vue', outline: Array(3), framework: {…}}


    // 给每一个对象（{}、[]）添加一个__ob__属性 值为Observer实例
    Object.defineProperty(value, '__ob__', {
      value: this,
      enumerable: false,
    });

    // 数组收集依赖准备
    this.dep = new Dep(value, value);

    if (Array.isArray(value)) {
      // step 2：处理数组[] 
      // 情况分为[{}]、[1,2]
      // 1、重写数组的方法 将数组的原型设置为重写的原型   
      value.__proto__ = arrayMethods;
      // 2、对数组中如果是对象元素重新劫持
      this.observeArray(value);
    } else {
      // step 1：处理对象{}
      this.walk(value);
    }
  }

  /**
   * step 1：处理对象{}
   * @param {*} obj 
   */
  walk(obj) {
    let keys = Object.keys(obj);
    // 第一层
    // ['message', 'todo', 'outline', 'framework'] 
    for(let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = obj[key];
      defineReactive(obj, key, value);
    }
  }

  /**
   * step 2：处理数组[] 情况分为[{}]
   * @param {*} items 
   */
  observeArray(items) {
    for(let i = 0; i < items.length; i++) {
      observe(items[i]);
    }
  }
}

function defineReactive(obj, key, value) {
  // 递归value 此时value也有可能是{}, 比如framework属性对应的值
  // console.log(obj, key, value)
  // {message: 'vue', todo: "Let's learn about responsiveness", outline: Array(3), framework: {…}, …}   'message'    'vue'
  // {message: 'vue', todo: "Let's learn about responsiveness", outline: Array(3), framework: {…}, …}   'todo'        'Let's learn about responsiveness'
  // {message: 'vue', todo: "Let's learn about responsiveness", outline: Array(3), framework: {…}, …}   'outline'    'Array(3)'

  const childDep = observe(value); 
  // console.log('---childDep----', childDep);

  // 同时根据data中的属性 创建dep，这时每个data中的属性都对应有一个dep
  const dep = new Dep(key, value); 
  // console.log(dep)


  Object.defineProperty(obj, key, {
    get() {
      // console.log('----childDep----', key, childDep);
      // console.log('----get----', key, Dep.target);
      // 收集依赖（{}）
      // vm._render 获取data中属性的时候watcher已经创建完成
      if (Dep.target) {
        dep.depend();
      }

      // 收集依赖 ([])
      if (Dep.target && childDep.dep) {
        childDep.dep.depend();
      }

      return value;
    },
    set(newVal) {
      // console.log('----set----', key, dep);
      if (newVal === value) return value;
      // newVal 也有可能是{}
      observe(newVal);
      value = newVal;

      // 通知所有观察者更新
      dep.notify()
    },
  })

  // console.log(dep)s


}
