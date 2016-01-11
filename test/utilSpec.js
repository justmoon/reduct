'use strict'

const util = require('..').util
const assert = require('chai').assert

describe('util', function () {
  describe('memoize', function () {
    class A {}
    class B {}

    beforeEach(function () {
      let unique = 0
      const makeUnique = key => key.name + unique++
      this.fn = util.memoize(makeUnique)
    })

    it('should return the same value if called twice using a function as a key', function () {
      const first = this.fn(A)
      const second = this.fn(A)
      assert.strictEqual(first, 'A0')
      assert.strictEqual(second, 'A0')
    })

    it('should return a different value if called twice using two different functions as the key', function () {
      const first = this.fn(A)
      const second = this.fn(B)
      assert.strictEqual(first, 'A0')
      assert.strictEqual(second, 'B1')
    })

    it('should continue to return the memoized value after doing something else', function () {
      const first = this.fn(A)
      const second = this.fn(B)
      const third = this.fn(A)
      assert.strictEqual(first, 'A0')
      assert.strictEqual(second, 'B1')
      assert.strictEqual(third, 'A0')
    })

    it('should throw when given a non-function', function () {
      assert.throws(function () {
        util.memoize({})
      }, /Expected a function/)
    })
  })

  describe('isUpperCase', function () {
    it('should return true for "A"', function () {
      assert.strictEqual(util.isUpperCase('A'), true)
    })

    it('should return false for "a"', function () {
      assert.strictEqual(util.isUpperCase('a'), false)
    })

    it('should return true for "Á', function () {
      assert.strictEqual(util.isUpperCase('Á'), true)
    })

    it('should return false for "á"', function () {
      assert.strictEqual(util.isUpperCase('á'), false)
    })

    it('should return true for "AAA"', function () {
      assert.strictEqual(util.isUpperCase('AAA'), true)
    })

    it('should return false for "AAa"', function () {
      assert.strictEqual(util.isUpperCase('AAa'), false)
    })
  })

  describe('toMixedCase', function () {
    it('should return "db" for "DB"', function () {
      assert.strictEqual(util.toMixedCase('DB'), 'db')
    })

    it('should return "httpRequest" for "HTTPRequest"', function () {
      assert.strictEqual(util.toMixedCase('HTTPRequest'), 'httpRequest')
    })

    it('should return "xml" for "XML"', function () {
      assert.strictEqual(util.toMixedCase('XML'), 'xml')
    })

    it('should return "http" for "HTTP"', function () {
      assert.strictEqual(util.toMixedCase('HTTP'), 'http')
    })

    it('should return "test" for "test"', function () {
      assert.strictEqual(util.toMixedCase('test'), 'test')
    })

    it('should return "log" for "Log"', function () {
      assert.strictEqual(util.toMixedCase('Log'), 'log')
    })

    it('should return "appRouter" for "AppRouter"', function () {
      assert.strictEqual(util.toMixedCase('AppRouter'), 'appRouter')
    })

    it('should return "äwkwardStuff" for "ÄwkwardStuff"', function () {
      assert.strictEqual(util.toMixedCase('ÄwkwardStuff'), 'äwkwardStuff')
    })

    it('should return "äwkwardStuff" for "ÄWKWARDStuff"', function () {
      assert.strictEqual(util.toMixedCase('ÄWKWARDStuff'), 'äwkwardStuff')
    })

    it('should return "" for ""', function () {
      assert.strictEqual(util.toMixedCase(''), '')
    })
  })
})
