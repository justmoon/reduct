'use strict'

function memoize (func, cache) {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function')
  }

  cache = cache || new Map()

  var memoized = function (key) {
    if (cache.has(key)) {
      return cache.get(key)
    }
    var result = func.call(this, key)
    memoized.cache = cache.set(key, result)
    return result
  }

  return memoized
}

function isUpperCase (subject) {
  return subject && subject.toUpperCase() === subject
}

function toMixedCase (name) {
  if (!name.length) return name

  let i = 0
  do {
    name = name[0].toLowerCase() + name.slice(1)
    i++
  } while (isUpperCase(name[i]) && isUpperCase(name[i + 1]))

  return name
}

Object.assign(exports, {
  memoize,
  isUpperCase,
  toMixedCase
})