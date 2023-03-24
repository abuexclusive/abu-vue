new Vue({
  el: '#demo',
  data: {
    message: 'vue',
    framework: { mode: 'mvvm' },
  },

  watch: {
    message: function(newVal, oldVal) {
      console.log(newVal, oldVal)
    },
    framework: {
      handler(newVal, oldVal) {
        console.log(newVal, oldVal)
      },
      immediate: true,
      dep: true,
    },
    'framework.mode': function(newVal, oldVal) {

    },
    framework: [
      (newVal, oldVal) => {}
    ],
    framework: 'fetchData'
  },

  methods: {
    fetchData: function() {
      
    }
  }
})


/**
 * watch
 * 
 * 监听data数据对象中的属性
 * immediate: 立即执行
 * dep: 深度监听
 * 
 * 使用方法
 * 1、属性： 方法
 * 2、属性： 数组
 * 3、属性： 对象
 * 4、属性： 字符串
 */