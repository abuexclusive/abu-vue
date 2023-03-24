# abu-vue
source code analysis of vue

## Observer

## Dep
data中属性的变化会触发不同的callback函数，可能是组件组件更新回调，也可能是watch选项 $watch的监听回调，此时我们可以为data中的每一个属性抽象一个'筐'用来存放对应的callback，等到触发属性的setter时，可以将'筐'中收集的callback拿出来通知它们执行。

那么我们应该在什么地方去收集？同时一个回调可能会依赖多个属性，比如模板或者computed，因此我们可以对属性求值，来触发属性的getter，在getter中让'筐'去找当前的回调，并收集它。

我们抽象的这个'筐'便是Dep类的实例，把回调抽象成一个Watcher类的实例。



## Watcher
```
const vm = new Vue({
  data: { message: 'hello vue' },
  watch: {
    message() {
      console.log('message 发生了变化 options')
    }
  }
})

vm.$watch('message', () => {
  console.log('message 发生了变化 $watch')
})
```
data中属性的变化可能引起多个callback，我们可以将callback暂且抽象为一个Watcher类的实例。



