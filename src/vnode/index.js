export function renderMixin(Vue) {

  /**
   * vnode
   * 
   * 描述节点
   * 
   * { tag, text, children }
   */
  Vue.prototype._render = function() {
    // 将render函数变为vnode

    
    let vm = this;
    let render = vm.$options.render;
    // 这里传入的this被with接收
    let vnode = render.call(this);

    // console.log('\n\n----vnode----\n\n', vnode, '\n\n');
    return vnode;
  }



  /**
   * _c 解析标签 
   */
  Vue.prototype._c = function() {
    // 创建标签
    // console.log('arguments: ', arguments)
    return createElement(...arguments);
  }

  Vue.prototype._v = function(text) {
    // console.log('_v: ', text)
    return createText(text);
  }

  /**
   * _s 解析插值表达式的  
   * 
   * 其中值由于with语法的关系 就是vm实例上的属性
   */
  Vue.prototype._s = function(val) {
    // console.log('_s: ', val)
    // 当前块状作用域访问 val的值 可能是字符串也可能是对象[]
    return val == null ? '' : (typeof val === 'object' ? JSON.stringify(val) : val);
  }


}

function createText(text) {
  return vnode(undefined, undefined, undefined, undefined, text);
}

// 创建元素
function createElement(tag, data={}, ...children) {
  // console.log('tag: ', tag);
  // console.log('data: ', data);
  // console.log('children: ', children);
  const [ child = null ] = children;
  const _children = !child ? [] : children;
  const key = data && data.key || undefined;
  return vnode(tag, data, key, _children);
}

// 创建vnode
function vnode(tag, data, key, children, text) {
  return {
    tag,
    data,
    key,
    children,
    text,
  };
}