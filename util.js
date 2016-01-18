'use strict'

function isUpperCase (subject) {
  return typeof subject === 'string' && subject.toUpperCase() === subject
}

function toMixedCase (name) {
  if (!name.length) return name

  let i = 0
  do {
    name = name.slice(0, i) + name[i].toLowerCase() + name.slice(i + 1)
    i++
  } while (isUpperCase(name[i]) &&
           name[i + 1] === undefined || isUpperCase(name[i + 1]))

  return name
}

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
  isUpperCase,
  toMixedCase,
  convertSetToArray,
  isClass,
  printPrettyConstructor
})
