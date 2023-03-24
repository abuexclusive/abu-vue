
export function generate(ast) {
  // console.log('ast, ', ast)

  /**
   * <div id="app" title="root">hello {{ message }} <span>你好</span></div>
   * 
   * {
   *   tag: 'div',
   *   type: 1,
   *   attrs: [
   *     {name: 'id', value: 'app'},
   *     {name: 'style', value: {color: red, font-size: '24px'}}
   *   ],
   *   children: [],
   *   parent: null
   * }
   * 
   * 字符串
   * render() {
   *   return _c('div', {id: app, title: root}, _v('hello' + _s(message)), _c('span', null, _v('你好'));
   * }
   * 
   * _c 解析标签; _v 解析文本; _s 解析插值表达式
   */

  const props = genProps(ast.attrs);

  const children = genChildren(ast);

  let code = `_c(${JSON.stringify(ast.tag)},${ast.attrs.length ? props : 'null'},${ast.children.length ? children : 'null'})`;
  return code;

}

/**
 * 处理属性
 * @param {*} attrs 
 * @returns 
 */
function genProps(attrs) {
  let str = '';
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    // console.log('attr,', attr.value);
    // {name: 'id', value: 'app'}
    // {name: 'style', value: 'color: red; font-size: 24px;'}
    if (attr.name === 'style') {
      let obj = {};
      attr.value.split(';').forEach(item => {
        let [key, val] = item && item.split(':');
        const k = key && key.replace(/\s/g, '');
        const v = val && val.replace(/\s/g, '');
        obj[k] = v;
      });
      attr.value = obj;
    }

    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }

  // slice(0, -1) 删除最后的逗号,
  return `{${str.slice(0, -1)}}`;
}


function genChildren(ast) {
  let children = ast.children;
  if (children) {
    return children.map(child => gen(child)).join(',');
  }
}

function gen(node) {
  // console.log('node,',node)
  // 两种情况

  if (node.type === 1) {
    // 1、节点
    return generate(node);
  } else {
    // 2、文本

    // 2.1 纯文本
    // 2.2 有插值表达式

    let text = node.text;
    // 判断是否有插值表达式
    const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`;
    }

    let tokens = [];
    let lastIndex = defaultTagRE.lastIndex = 0;

    // hello{{message}} 
    let match;
    // 可能会有多个插值表达式
    while (match = defaultTagRE.exec(text)) {
      // console.log('match,', match)
      let index = match.index;
      if (index > lastIndex) {
        // 截取纯文本
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      // 插值表达式
      tokens.push(`_s(${match[1].trim()})`);
      lastIndex = index + match[0].length;
     
    }

    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }

    return `_v(${tokens.join('+')})`;

  }
}
