'use strict'

function convertSetToArray (set) {
  const arr = []
  for (let v of set) {
    arr.push(v)
  }
  return arr
}

function isClass (candidate) {
  return typeof candidate === 'function' && /^\s*class\s+/.test(candidate.toString())
}

function printPrettyConstructor (key) {
  if (typeof key === 'string') return key
  return key.name || (isClass(key) ? '[anonymous class]' : '[anonymous fn]')
}

Object.assign(exports, {
  convertSetToArray,
  isClass,
  printPrettyConstructor
})
