import { mergeOptions } from "../util/index";

export function initMixin(Vue) {

  Vue.mixin = function(mixin) {
    
    /**
     * 
     * 这里的this 就是Vue，把Vue.mixin({})中的配置项合并成一个 
     * 
     * Vue.mixin({
     *  created: function a() {}
     * })
     * 
     * Vue.mixin({
     *  created: function b() {},
     *  mounted: function c() {},
     * })
     * 
     * 合并完效果为 { created: [a, b], mounted: [c]}
     */
     

     // 当只有一个Vue.mixin时 第一次this.options = {}
     // 当有两个Vue.mixin时，第二次this.options = { created: [a] }
     
     const options = this.options || {};
     this.options = mergeOptions(options, mixin);
    
    
  }

}