'use strict'

const reduct = require('.')
const assert = require('assert')

class C {
  constructor () {
    console.log('C is instantiated')
  }
}

class B {
  constructor (deps) {
    // Get dependencies
    this.c = deps(C)
  }
}

class A {
  constructor (deps) {
    this.b = deps(B)
    this.c = deps(C)
  }
}

var a = reduct(A)
console.log(a)
assert(a instanceof A)
assert(a.b instanceof B)
assert(a.c instanceof C)
assert(a.b.c === a.c)
