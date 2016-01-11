'use strict'

const util = require('./util')

module.exports = function createReduct (Constructor, parent) {
  // Convenience: If a Map is passed as a parent injector, convert it
  if (parent instanceof Map) parent = key => parent.get(key)
  // Convenience: If an object is passed as a parent injector, convert it
  else if (typeof parent === 'object') parent = key => parent[key.name]

  const getDependency = util.memoize((Constructor) => {
    // If there is a parent injector, query it first
    const instanceFromParent = parent ? parent(Constructor) : null
    if (instanceFromParent) return instanceFromParent

    // Otherwise return a new instance
    return new Constructor(reduct)
  })

  function reduct (context) {
    if (typeof context === 'function') {
      return getDependency(context)
    } else if (typeof context === 'object') {
      // Shorthand syntax: Loop over remaining arguments, instantiate them and
      // assign them to the context using an auto-generated name.
      const constructors = Array.prototype.slice.call(arguments, 1)

      for (let Constructor of constructors) {
        if (!Constructor.name) {
          throw new Error('Constructors must have a name when using reduct shorthand syntax')
        }
        const targetName = util.toMixedCase(Constructor.name)
        context[targetName] = getDependency(Constructor)
      }
    }
  }

  // If called without arguments, just return the injector
  if (!Constructor) return reduct

  return new Constructor(reduct)
}

module.exports.util = util
