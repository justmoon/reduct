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
    // Get dependencies using normal syntax
    this.c = deps(C)
  }
}

class A {
  constructor (deps) {
    // Get dependencies using shorthand syntax
    deps(this, B, C)
  }
}

var a = reduct(A)
console.log(a)
assert(a instanceof A)
assert(a.b instanceof B)
assert(a.c instanceof C)
assert(a.b.c === a.c)
