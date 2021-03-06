'use strict'

import reduct from '..'
import chai = require('chai')
const assert = chai.assert

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

  it('should pass an injector to every constructor', function () {
    class C {
      b: B

      constructor (deps: any) {
        this.b = deps(B)
      }
    }
    class D {
      c: C

      constructor (deps: any) {
        this.c = deps(C)
      }
    }

    const d = reduct()(D)

    assert.instanceOf(d, D)
    assert.instanceOf(d.c, C)
    assert.instanceOf(d.c.b, B)
  })

  it('should allow parent injectors', function () {
    const injector = reduct(() => 'foobar')
    const test = injector(A)
    assert.strictEqual(test, 'foobar')
  })

  it('should allow maps as parent injectors', function () {
    const map = new Map()
    map.set(A, 'denied')
    const injector = reduct(map)
    assert.strictEqual(injector(A), 'denied')
    assert.instanceOf(injector(B), B)
  })

  it('should allow objects as parent injectors', function () {
    const injector = reduct({ A: 'yolo' })
    assert.strictEqual(injector(A), 'yolo')
    assert.instanceOf(injector(B), B)
  })

  it('should throw when passed an invalid value as a parent injector', function () {
    assert.throws(
      function () {
        reduct(true)
      },
      /Parent injector must be a Map, object or function/
    )
  })

  it('should throw when an invalid value is passed to the injector', function () {
    class C {
      constructor (deps: any) {
        deps(false)
      }
    }

    assert.throws(
      function () {
        reduct()(C)
      },
      /Dependencies must be constructors\/factories, but got: boolean/
    )
  })

  it('should return a mapped instance even if it is the main instance requested', function () {
    const map = new Map()
    map.set(A, new B())
    const b = reduct(map)(A)
    assert.instanceOf(b, B)
  })

  it('should return instances of override class', function () {
    // Your app code
    class Database {}

    class App {
      database: any

      constructor (deps: any) {
        this.database = deps(Database)
      }
    }

    // Your test code
    class MockDatabase {}

    const deps = reduct()
    deps.setOverride(Database, MockDatabase)
    const app = deps(App)
    assert.instanceOf(app, App)
    assert.instanceOf(app.database, MockDatabase)
  })

  it('should throw in case of a circular reference', function () {
    class C {
      d: D

      constructor (deps: any) {
        this.d = deps(D)
      }
    }

    class D {
      c: C

      constructor (deps: any) {
        this.c = deps(C)
      }
    }

    assert.throws(
      function () {
        reduct()(C)
      },
      /Circular dependency detected: C => D => C/
    )
  })

  it('should allow circular references using .later() - asymmetric', function () {
    class C {
      d: D

      constructor (deps: any) {
        deps.later(() => {
          this.d = deps(D)
        })
      }
    }

    class D {
      c: C

      constructor (deps: any) {
        this.c = deps(C)
      }
    }

    const c = reduct()(C)

    assert.throws(
      function () {
        reduct()(D)
      },
      /Circular dependency detected: D => C \(post\) => D/
    )

    assert.instanceOf(c, C)
    assert.instanceOf(c.d, D)
    assert.strictEqual(c.d.c, c)
  })

  it('should allow circular references using .later() - symmetric', function () {
    class C {
      d: D

      constructor (deps: any) {
        deps.later(() => {
          this.d = deps(D)
        })
      }
    }

    class D {
      c: C

      constructor (deps: any) {
        deps.later(() => {
          this.c = deps(C)
        })
      }
    }

    const c = reduct()(C)
    const d = reduct()(D)

    assert.instanceOf(c, C)
    assert.instanceOf(c.d, D)
    assert.strictEqual(c.d.c, c)
    assert.instanceOf(d, D)
    assert.instanceOf(d.c, C)
    assert.strictEqual(d.c.d, d)
  })

  it('should throw if we try to construct something that is not a function', function () {
    assert.throws(
      () => {
        reduct()({} as any)
      },
      /Dependencies must be constructors\/factories, but got: object/
    )
  })
})
