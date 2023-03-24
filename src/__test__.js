// oldVnode有el属性
const oldVnode = {
  tag: 'div',
  key: undefined,
  text: undefined,
  // el: {
  //   parentNode: 'app'
  // }
  data: { id: 'app', style: { color: 'red' } },
  children: [
    { tag: undefined, key: undefined, text: 'zhangsan', data: undefined,  children: undefined },
  ],
};

const newVnode = {
  tag: 'p',
  key: undefined,
  text: undefined,
  data: { id: 'root', style: { color: 'red' } },
  children: [
    { tag: undefined, key: undefined, text: 'lisi', data: undefined,  children: undefined },
  ],
};

(
  function patch(oldVnode, newVnode) {
    // 1、元素不一样 不用进行比对 直接替换
    if (oldVnode.tag !== newVnode.tag) {
      // （1）找到oldVnode的父节点 oldVnode.el.parentNode
      // （2）父节点直接替换子节点 replaceChild(createElm(newVnode))
      // oldVnode.el.parentNode.replaceChild(createElm(newVnode));

      oldVnode = newVnode
    } else {
       
    }
    console.log(oldVnode)
  }
)(oldVnode, newVnode);


// vnode => 真是Dom
function createElm(vnode) {
  return vnode;
  // const {tag, children, data, key, text} = vnode;

  // //  tag 可能为'div'或者undefined
  // if (typeof tag === 'string') {
  //   vnode.elm = document.createElement(tag);
  //   if (children.length) {
  //     children.forEach(child => {
  //       vnode.elm.appendChild(createElm(child));
  //     });
  //   }
  // } else {
  //   vnode.elm = document.createTextNode(text);
  // }

  // return vnode.elm;
};
