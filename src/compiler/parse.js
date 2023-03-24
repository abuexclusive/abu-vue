// 标签名称
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; 
// <span:xx> 
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
// 标签开头的正则 捕获的内容就是标签名
const startTagOpen = new RegExp(`^<${qnameCapture}`);
// > 匹配标签结束的
const startTagClose = /^\s*(\/?)>/;
// 匹配标签结尾 </div>
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
// id="app"
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
// {{}}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;


export function parseHTML(html) {
  // console.log('html, ', html)
  // <div id="app" title="root">hello {{ message }}</div>
  // 匹配一个删除一个 直到html 字符串为空，遇到开始标签入栈 
  // 开始标签 文本 结束标签

  // 使用栈结构 利用进栈和出栈 能够知道元素之间的父子关系
  const stack = [];
  // 根元素
  let root;
  // 当前元素的父元素
  let currentParent;
  

  while(html) {
    let textEnd = html.indexOf('<');
    if (textEnd === 0) {
      // 标签  两种情况 (1) 开始标签<div>  (2) 结束标签</div>
      // (1) 开始标签<div>
      const startTagMatch = parseStartTag();
      // console.log('----startTagMatch----,', startTagMatch)
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
      }

      // console.log('----html----,', html)
      // hello {{ message }}</div>

      // (2) 结束标签</div>
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        // console.log('----endTagMatch----,', endTagMatch)
        // ['</div>', 'div']
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
      }
      continue;
    }

    if (textEnd > 0) {
      // 文本
      // hello {{ message }}</div>
      // textEnd 就可以获取到文本结束的位置

      let text = html.slice(0, textEnd);
      // console.log(text)
      // hello {{ message }}

      if (text) {
        advance(text.length);
        charts(text);
      }
      // console.log(html)
      // </div>
      continue;
    }
    
  }

  /**
   * parseStartTag 方法会把 <div id="app" title="root"> 全部处理完
   */
  function parseStartTag() {
    const start = html.match(startTagOpen);
    // console.log('----start----,', start)
    // ['<div', 'div']
    if (start) {
      let match = {
        tagName: start[1],
        attrs: [],
      };

      // 删除匹配到的标签
      advance(start[0].length);
      // console.log(html) 
      // id="app" title="root">hello {{ message }}</div>

      // 解决属性： 属性有多个 和 >
      let attr = html.match(attribute);
      // console.log('attr,', attr);
      // [' id="app"', 'id', '=', 'app']
      // [' title="root"', 'title', '=', 'root'
      let end = html.match(startTagClose);
      // console.log('end,', end);
      // null
      // null
      // >

      // end为null attr有值 处理的属性
      while (!end && attr) {
        // console.log('attr,', attr);
        advance(attr[0].length);
        // console.log(html) 
        // title="root">hello {{ message }}</div>
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5], 
        });
        attr = html.match(attribute);
        end = html.match(startTagClose);
      }

      // console.log('match,', match);

      if (end) {
        advance(end[0].length);
        return match;
      }

    }
  }


  function advance(n) {
    html = html.substring(n);
  }


  /**
   * start、charts、end三个函数构建最终的ast语法树
   * 
   * 开始标签  进栈
   */
  function start(tag, attrs) {
    // console.log('----开始标签----,', tag, attrs);
    // div span
    let element = createASTElement(tag, attrs);
    if (!root) {
      root = element;
    }

    // 处理文本元素做准备
    currentParent = element;
    stack.push(element);
  }

  /**
   * 
   * 文本
   */
  function charts(text) {
    // console.log('----文本----,', text);
    // hello {{ message }} 
    // 你好

    // 取消空格
    // text = text.replace(/\s/g, '');
    if (text) {
      currentParent.children.push({
        type: 3,
        text,
      });
    }
  }

  /**
   * 
   * 结束标签  出栈
   */
  function end(tag) {
    // console.log('----结束标签----,', tag);
    // span div
    let element = stack.pop();
    // 栈里最后一个元素 就是pop出元素的父亲
    currentParent = stack[stack.length - 1];
    if (currentParent) {
      element.parent = currentParent.tag;
      currentParent.children.push(element);
    }

  }

  return root;

}

function createASTElement(tag, attrs) {
  return {
    // 节点类型
    type: 1,
    tag,
    attrs,
    children: [],
    parent: null,
  };
}