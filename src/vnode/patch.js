import { isDef, isUndef, sameVnode } from '../util/index';

export function patch(oldVnode, vnode) {
  // console.log('oldVnode: ', oldVnode);
  // console.log('vnode: ', vnode);

  /**
   * 
   * vnode -> 真实dom
   * 1、创建新的dom
   * 
   * 2、替换新的dom
   * （1）、获取父节点
   * （2）、插入新dom
   * （3）、删除旧dom
   */

  if (oldVnode.nodeType === 1) {

    // 第一次渲染 oldVnode是真实Dom 直接根据vode转换成真实Dom替换
    const elm  = createElm(vnode);

    // console.log('\n\n----真实dom----\n\n', elm, '\n\n');
  
    const parentElm = oldVnode.parentNode;  // body
    parentElm.insertBefore(elm, oldVnode.nextSibling);
    parentElm.removeChild(oldVnode);
    return elm;

  } else {

    // 1、标签（tag）不一样 直接替换
    if (oldVnode.tag !== vnode.tag) {
      const parentElm = oldVnode.elm.parentNode;
      const childDom = createElm(vnode);
      return parentElm.replaceChild(childDom, oldVnode.elm);

    } else {
      // 2、标签（tag）一样 <div>vue</div> <div>react</div>
      patchVnode(oldVnode, vnode);
    }
    
  }

}


// 创建新的dom
export function createElm(vnode) {

  const {tag, children = [], data, key, text} = vnode;

  //  tag 可能为'div'或者undefined
  if (typeof tag === 'string') {
    vnode.elm = document.createElement(tag);
    updateProps(vnode);
    if (children.length) {
      children.forEach(child => {
        vnode.elm.appendChild(createElm(child));
      });
    }
  } else {
    vnode.elm = document.createTextNode(text);
  }

  return vnode.elm;

}


function updateProps(vnode, oldProps={}) {
  const newProps = vnode.data || {};
  // 获取到真实Dom 并赋值属性
  const elm = vnode.elm;


  // 1、老的有 新的没有 直接删除属性
  // 这一步就会把title属性删除
  for (const key in oldProps) {
    if (!newProps.key) {
      elm.removeAttribute(key)
    }
  }

  // 2、老的样式
  const newStyle = newProps.style || {};
  const oldStyle = oldProps.style || {};
  for (const key in oldStyle) {
    if (!newStyle[key]) {
      elm.style = '';
    }
  }


  // 初次渲染 和 处理新的属性
  for (const key in newProps) {
    if (key === 'style') {
      for (const styleName in newProps.style) {
        const value = newProps.style[styleName];
        elm.style[styleName] = value;
      }
    } else if (key === 'class') {

    } else {
      elm.setAttribute(key, newProps[key]);
    }
  }
}

function addVnodes(elm, vnodes) {
  for (let i = 0; i < vnodes.length; i++) {
    const child = vnodes[i];
    // 添加到真实Dom
    elm.appendChild(createElm(child));
  }

}

function removeVnodes(elm) {
  const nodes = elm.childNodes;
  if (isDef(nodes)) {
    for (let i = 0; i < nodes.length; i++) {
      const child = nodes[i];
      elm.removeChild(child);
    }
  }
  
}

function patchVnode(oldVnode, vnode) {
  // console.log('oldVnode: ', oldVnode);
  // console.log('vnode: ', vnode);

  // 2、标签（tag）一样 <div>vue</div> <div>react</div>

  // 2.1 文本
  // if (!oldVnode.tag) {
  //   if (oldVnode.text !== vnode.text) {
  //     return oldVnode.elm.textContent = vnode.text;
  //   }
  // }

  // 2.2 属性 <div id="app" title="test">vue</div> <div id="root" style="color: blue">react</div>
  // 复制：直接将oldVnode的属性复制给新的
  const elm = vnode.elm = oldVnode.elm;
  // 如上新旧真实Dom的属性一样 然后再根据新旧变化增加删除
  updateProps(vnode, oldVnode.data || {});

  // 3、处理子元素
  const oldCh = oldVnode.children || [];
  const ch = vnode.children || [];

  if (isUndef(vnode.text)) {
    // 不是文本节点

    if (isDef(oldCh) && isDef(ch)) {
      // 3.3、oldVnode有children vnode有children
      
      updateChildren(oldCh, ch, elm);
  
    } else if (isDef(ch)) {
      // 3.2、oldVnode没有children vnode有children 新增子节点
      addVnodes(elm, ch);
  
    } else if (isDef(oldCh)) {
      // 3.1、oldVnode有children vnode没有children 删除子节点ok
      removeVnodes(elm);
  
    }

  } else {
    // 文本节点
    if (oldVnode.text !== vnode.text) {
      elm.textContent = vnode.text;
    }
  }

  
}

// 双指针首位比对
function updateChildren(oldCh, newCh, parentElm) {
  // console.log('oldCh: ', oldCh);
  // console.log('newCh: ', newCh);

  // oldCh 头部指针
  let oldStartIdx = 0;
  // oldCh 尾部指针
  let oldEndIdx = oldCh.length - 1;
  // oldCh 首位
  let oldStartVnode = oldCh[0];
  // oldCh 最后位
  let oldEndVnode = oldCh[oldEndIdx];
  // newCh 头部指针
  let newStartIdx = 0;
  // newCh 尾部指针
  let newEndIdx = newCh.length - 1;
  // newCh 首位
  let newStartVnode = newCh[0];
  // newCh 最后位
  let newEndVnode = newCh[newEndIdx];

  // 双指针比对 当oldStartIdx > oldEndIdx 或者 newStartIdx > newEndVnode时停止循环
  while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
    if (isUndef(oldStartVnode)) {
      // 由于第五种情况的存在 旧节点的vnode可能为undefined
      // 以下都拿旧节点的开始和结束节点比较 所以需要做判空处理
      oldStartVnode = oldCh[++oldStartIdx];

    } else if (isUndef(oldEndVnode)) {
      oldEndVnode = oldCh[--oldEndIdx];

    } else if (sameVnode(oldStartVnode, newStartVnode)) {
      // console.log('-----策略1-----');
      // 策略1: oldStartVnode, newStartVnode
      // eg：oldCh [a, b, c, d]  newCh [a, b, c, d]

      // 递归 
      patchVnode(oldStartVnode, newStartVnode);
      // 移动指针
      oldStartVnode = oldCh[++oldStartIdx];
      newStartVnode = newCh[++newStartIdx];

    } else if (sameVnode(oldEndVnode, newEndVnode)) {
      // console.log('-----策略2-----');
      // 策略2: oldEndVnode, newStartVnode
      // eg：oldCh [b, a, c, d]  newCh [a, b, c, d]

      // 递归 
      patchVnode(oldEndVnode, newEndVnode);
      // 移动指针
      oldEndVnode = oldCh[--oldEndIdx];
      newEndVnode = newCh[--newEndIdx];

    } else if (sameVnode(oldStartVnode, newEndVnode)) {
      // console.log('-----策略3-----');
      // 策略3: oldStartVnode, newEndVnode
      // eg：oldCh [d, a, b, c]  newCh [a, b, c, d]

      // 递归 
      patchVnode(oldStartVnode, newEndVnode);

      // 因为是老的开始节点和新的结束节点相等，以新的节点顺序为准，
      // 这时oldStartVnode应该是在后面的，所以要将oldStartVnode对应的真实Dom移动到oldEndVnode对应的Dom之后
      parentElm.insertBefore(oldStartVnode.elm, oldEndVnode.elm.nextSibling)
      // 移动指针
      oldStartVnode = oldCh[++oldStartIdx];
      newEndVnode = newCh[--newEndIdx];

    } else if (sameVnode(oldEndVnode, newStartVnode)) {
      // console.log('-----策略4-----');
      // 策略4: oldEndVnode, newStartVnode
      // eg：oldCh [b, c, d, a]  newCh [a, b, c, d]

      // 递归 
      patchVnode(oldEndVnode, newStartVnode);

      // 因为这里老的结束节点和新的开始节点相等，还是以新的节点数序为准
      // 这是oldEndVnode应该是在前面的，所以要将oldEndVnode对应的真实Dom移动到oldStartVnode对应的Dom之前
      parentElm.insertBefore(oldEndVnode.elm, oldStartVnode.elm)
      // 移动指针
      oldEndVnode = oldCh[--oldEndIdx];
      newStartVnode = newCh[++newStartIdx];

    } else {
      // 以上策略都不满足
      /**
       * 策略5: 查找  这个查找就只跟key有关了
       * eg：oldCh [b, d, c, a]  newCh [a, b, c, d]
       * oldStartIdx=0,保持不变，在newCh中查找oldStartVnode，如果找到将newStartVnode放到页面newStartIdx++，并且在oldCh找newStartVnode，找到后将oldCh中的newStartVnode设置为undefined
       * 
       * 
       */

      // oldKeyToIdx 创建一个oldCh key和下标的映射, 
      // 比如oldCh的key和值分别都是b, d, c, a， 此时oldKeyToIdx = { b: 0, d: 1, a: 2, c: 3 }
      // 为什么是以oldStartIdx开头 是因为oldStartIdx是指针移动的 移动到第几位说明前面的vnode已经匹配过以上四种情况了
      const oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
      // console.log(oldKeyToIdx)
      // 在旧节点oldCh中查找新的开始节点newStartVnode，并且不管在oldCh有没有查找到新节点指针都要向下移动
      // 查找分为两种情况 
      // 1、找到了，因为是新的开始节点和老的节点匹配 所以如果找到了 就要将老节点移动到老开始节点之前, 并且将找到的旧节点在就数据中设置为undefined
      // 2、未找到，说明是个全新的节点需要创建Dom 并且需要将创建的Dom放入老开始节点之前
      const idxInOld = oldKeyToIdx[newStartVnode.key];

      if (isUndef(idxInOld)) {
        // 未找到 则说明是个全新的节点 需要创建
        parentElm.insertBefore(createElm(newStartVnode), oldStartVnode.elm);

      } else {
        // 找到了 移动位置
        const vnodeToMove = oldCh[idxInOld];
        patchVnode(vnodeToMove, newStartVnode);

        // 将找的旧节点设置为undefined
        oldCh[idxInOld] = undefined;

        parentElm.insertBefore(vnodeToMove.elm, oldStartVnode.elm);

      }
      newStartVnode = newCh[++newStartIdx];
      return;
    }
  }

  // 策略6: 创建和删除
  // console.log('oldStartIdx: ', oldStartIdx);
  // console.log('oldEndIdx: ', oldEndIdx);
  if (oldStartIdx > oldEndIdx) {
    // 说明oldCh 比 newCh 元素要少, newCh有剩余元素 需要新增元素
    // eg：oldCh [a, b, c]  newCh [a, b, c, d]

    // console.table({ oldStartIdx,oldEndIdx, newStartIdx, newEndIdx });
    // 新元素的个数 newEndIdx - newStartIdx 
    // for (let i = newStartIdx; i <= newEndIdx; i++) {
    //   parentElm.appendChild(createElm(newCh[i]));
    // }

  }

  if (newStartIdx > newEndIdx) {
    // 说明oldCh 比 newCh 元素要多 oldCh有剩余元素 需要删除元素 需要删除的元素就是oldStartVnode 和 oldEndVnode之间的元素
    for (let i = oldStartIdx; i <= oldEndIdx; i++) {
      parentElm.removeChild(oldCh[i].elm);
    }
  }
 
}


function createKeyToOldIdx(children, beginIdx, endIdx) {
  // console.log(children)
  let key, i;
  const map = {};
  for (i = beginIdx; i <= endIdx; i++) {
    key = children[i].key;
    if (isDef(key)) {
      map[key] = i;
    }
  }
  return map;
}