/**
 * 重新数组的方法
 * 
 * 1、数组的重写方法 要求既能执行数组之前方法的功能 还能够劫持到数组的相关操作
 * 
 * step 1: 获取数组原来的方法
 * 
 * step 2: 劫持数组方法
 */

const arrayProto = Array.prototype;


/**
 * Object.create可以生成一个对象，生成对象的原型指向的是传入的第一个参数
 * 
 * const obj = Object.create(proto);
 * obj.__proto__ === proto;
 */

// arrayProto {concat: ƒ concat(),  push: ƒ push(), pop: ƒ pop()}
export const arrayMethods = Object.create(arrayProto);


const methods = [
  'push',
  'pop',
  'unshift',
  'shift',
  'splice',
  'sort',
  'reverse'
];

methods.forEach(method => {
  arrayMethods[method] = function(...args) {

    // 重写
    // 1、劫持数组
    // console.log('劫持数组', args);
    // 数组操作 对添加进来的对象也要进行劫持
    let inserted;
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args;
        break;
      case 'splice':
        inserted = args.splice(2);
        break;
    }
    // console.log('劫持添加的对象', inserted);
    // inserted [{}] 
    // 对数组中的对象劫持 Observer类提供了observeArray方法
    // console.log('__ob___', this.__ob__)
    const ob = this.__ob__;
    if (inserted) {
      ob.observeArray(inserted);
    }
    
  
    // 2、执行数组原来的方法
    const result = arrayProto[method].apply(this, args);

    // 通知watcher更新数据
    ob.dep.notify();


    return result; 
  };
});