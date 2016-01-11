'use strict'

const reduct = require('..')
const assert = require('chai').assert

describe('reduct', function () {
  class A {}
  class B {}

  it('should cache instances', function () {
    const injector = reduct()

    const instance1 = injector(A)
    const instance2 = injector(A)

    assert.instanceOf(instance1, A)
    assert.strictEqual(instance1, instance2)
  })

  it('should return a new injector when called with no arguments', function () {
    const injector1 = reduct()
    const injector2 = reduct()

    const instance1 = injector1(A)
    const instance2 = injector2(A)
    const instance3 = injector1(A)

    assert.instanceOf(instance1, A)
    assert.instanceOf(instance2, A)
    assert.instanceOf(instance3, A)
    assert.strictEqual(instance1, instance3)
    assert.notStrictEqual(instance1, instance2)
  })

  it('should instantiate and assign dependencies when using shorthand syntax', function () {
    class Shorthand {
      constructor (deps) {
        deps(this, A, B)
      }
    }

    const shorthand = reduct(Shorthand)

    assert.instanceOf(shorthand, Shorthand)
    assert.instanceOf(shorthand.a, A)
    assert.instanceOf(shorthand.b, B)
  })

  it('should pass an injector to every constructor', function () {
    class C {
      constructor (deps) {
        this.b = deps(B)
      }
    }
    class D {
      constructor (deps) {
        this.c = deps(C)
      }
    }

    const d = reduct(D)

    assert.instanceOf(d, D)
    assert.instanceOf(d.c, C)
    assert.instanceOf(d.c.b, B)
  })

  it('should allow parent injectors', function () {
    const injector = reduct(null, () => 'foobar')
    const test = injector(A)
    assert.strictEqual(test, 'foobar')
  })

  it('should allow maps as parent injectors', function () {
    const map = new Map()
    map.set(A, 'denied')
    const injector = reduct(null, map)
    assert.strictEqual(injector(A), 'denied')
    assert.instanceOf(injector(B), B)
  })

  it('should allow objects as parent injectors', function () {
    const injector = reduct(null, {A: 'yolo'})
    assert.strictEqual(injector(A), 'yolo')
    assert.instanceOf(injector(B), B)
  })

  it('should throw when passed an invalid value as a parent injector', function () {
    assert.throws(function () {
      reduct(null, true)
    }, /Parent injector must be a Map, object or function/)
  })

  it('should throw when using shorthand against an anonymous constructor', function () {
    const E = function () {}
    class Shorthand {
      constructor (deps) {
        deps(this, E)
      }
    }

    assert.throws(function () {
      reduct(Shorthand)
    }, /Constructors must have a name when using reduct shorthand syntax/)
  })

  it('should throw when an invalid value is passed to the injector', function () {
    class C {
      constructor (deps) {
        deps(false)
      }
    }

    assert.throws(function () {
      reduct(C)
    }, /Injector expected a constructor/)
  })
})