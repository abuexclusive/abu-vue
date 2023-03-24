const toString = Object.prototype.toString;
const OBJECT_STRING = '[object Object]';
export function isPlainObject (obj) {
  return toString.call(obj) === OBJECT_STRING;
}


// 检测函数 toString 之后的字符串中是否带有 native code 片段
// toString 是 Function 的一个实例方法
// 如果是浏览器内置函数调用实例方法 toString 返回的结果是function Promise() { [native code] }。
export function isNative(Ctor) {
  return /native code/.test(Ctor.toString())
}

export function noop () {}


const bailRE = /[^\w.$]/
export function parsePath (path) {
  if (bailRE.test(path)) {
    return
  } else {
    const segments = path.split('.')
    return function (obj) {
      for (let i = 0; i < segments.length; i++) {
        if (!obj) return
        obj = obj[segments[i]]
      }
      return obj
    }
  }
}

export function isDef(v) {
  return v !== undefined && v !== null && v.length
}

export function isUndef(v) {
  return v === undefined || v === null
}

export function sameVnode(a, b) {
  return (a.tag === b.tag) && (a.key === b.key);
}