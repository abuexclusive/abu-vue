import { parseHTML } from "./parse";
import { generate } from "./generate";


export function compileToFunctions(template) {

  // template: string
  // <div id="app">hello {{ message }}</div>
  // console.log('\n\n----template----\n\n', template, '\n\n')

  
  // 1、template模板转化成ast语法树

  /**
   * ast语法树
   * 
   * {
   *   tag: 'div',
   *   attrs: [
   *     { id: 'app' },
   *     .....
   *   ],
   *   children: [
   *     { tag: '', text: 'hello' },
   *     { tag: 'h1', ... }
   *   ]
   * }
   */

  const ast = parseHTML(template);
  // console.log('----ast----\n\n', ast, '\n\n')

  // 2、ast语法树转化成render函数

  // 2.1  ast语法树转成字符串
  // 2.2  字符串转成函数

  /**
   * <div id="app" title="root">hello {{ message }} <span>{{library.feature}}</span></div>
   * 
   * 字符串
   * render() {
   *   return _c('div', {id: app, title: root}, _v(hello + _s(message)), _c('span', null, _s(library.feature));
   * }
   * 
   * _c 解析标签; _v 解析文本; _s解析插值表达式
   */
  const code = generate(ast);
  // console.log('\n\n----render字符串----\n\n', code, '\n\n');


  
  
  
  // 3、render字符串转化为render函数

  // 字符串包含_c、_v、_s 从哪里去值

  /**
   * let obj = { a: 1, b: 2 };
   * 
   * with语法就是给执行的代码块传入一个对象obj 该代码块内访问的局部变量就是obj的变量
   * 
   * with(obj) {
   *   console.log(a, b)  
   *   // 1, 2
   * }
   */
  const render = new Function(`with(this){return ${code}}`);
  // console.log('\n\n\n----render函数----\n\n\n', render, '\n\n\n');

  return render;

}
