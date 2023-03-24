export * from './common';
export * from './env';

export const Hooks = [
  'beforeCreate',
  'created',
  'beforeMount',
  'mounted',
  'beforeUpdate',
  'updated',
  'beforeDestroy',
  'destroyed',
  'activated',
  'deactivated'
];

// 合并生命周期的函数都是相同的功能  策略模式

function mergeHook(parentVal, childVal) {
  // console.log("parentVal: ", parentVal)
  // console.log("childVal: ", childVal)
  if (childVal) {
    if (parentVal) {
      // parentVal 第二次已经是一个数组
      return parentVal.concat(childVal);
    } else {
      return [childVal];
    }
  } else {
    return parentVal;
  }
}

const strats = {};
Hooks.forEach(hook => {
  strats[hook] = mergeHook;
});

strats.data = function(parentVal, childVal) {
  // console.log(parentVal, childVal)
  return childVal;
}

// strats.computed = function(parentVal, childVal) {

// }

// strats.watch = function(parentVal, childVal) {
  
// }


// strats.methods = function(parentVal, childVal) {
  
// }


/**
 * 作用就是合并两个对象
 * 
 * @param {*} parent { created: function a() {} }
 * @param {*} child { created: function b() {}, mounted: function c() {} }
 * @returns { created: [a, b], mounted: [c] }
 */
export function mergeOptions(parent = {}, child) {
  const options = {};

  // parent 无值不进入 
  for (let key in parent) {
    mergeField(key);
  }

  for (let key in child) {
    mergeField(key);
  }

  function mergeField(key) {
    const strat = strats[key];
    if (strat) {
      options[key] = strat(parent[key], child[key]);
    } else {
      options[key] = child[key];
    }
  }

  return options;
}

