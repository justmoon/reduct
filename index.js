'use strict'

const util = require('./util')

module.exports = function createReduct (Constructor, parent) {
  let parentInjector
  // Convenience: If a Map is passed as a parent injector, convert it
  if (parent instanceof Map) parentInjector = key => parent.get(key)
  // Convenience: If an object is passed as a parent injector, convert it
  else if (typeof parent === 'object') parentInjector = key => parent[key.name]
  else if (typeof parent === 'function') parentInjector = parent
  else if (typeof parent === 'undefined') parentInjector = () => false
  else throw new TypeError('Parent injector must be a Map, object or function')

  const cache = new Map()
  let stack = new Set()
  let queue = []

  const reduct = (Constructor) => {
    if (typeof Constructor !== 'function') {
      throw new TypeError('Dependencies must be constructors/factories, but got: ' + typeof Constructor)
    }

    if (stack.has(Constructor)) {
      const stackArray = util.convertSetToArray(stack)
      stackArray.push(Constructor)
      const prettyStack = stackArray.map(util.printPrettyConstructor).join(' => ')
      throw new Error('Circular dependency detected: ' + prettyStack)
    }
    stack.add(Constructor)

    const instance =
      cache.get(Constructor) ||       // First, try the cache
      parentInjector(Constructor) ||  // Then try the parent injector
      new Constructor(reduct)         // Finally, construct a new instance

    stack.delete(Constructor)

    // Cache the instance
    cache.set(Constructor, instance)

    // Run any registered post-constructors
    if (queue.length) {
      stack.add(util.printPrettyConstructor(Constructor) + ' (post)')
      const lastQueue = queue
      queue = []
      lastQueue.forEach((fn) => fn())
    }

    return instance
  }

  reduct.later = (fn) => queue.push(fn)

  // If called without arguments, just return the injector
  if (!Constructor) return reduct

  return reduct(Constructor)
}

module.exports.util = util
