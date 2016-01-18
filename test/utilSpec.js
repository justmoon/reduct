'use strict'

const util = require('..').util
const assert = require('chai').assert

describe('util', function () {
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

  describe('convertSetToArray', function () {
    it('should return elements in order', function () {
      const set = new Set()
      set.add('a')
      set.add(9)
      set.add('boo')
      set.add(util)

      const arr = util.convertSetToArray(set)

      assert.deepEqual(arr, ['a', 9, 'boo', util])
    })
  })

  describe('printPrettyConstructor', function () {
    it('should print classes by their name', function () {
      class A {}

      const pretty = util.printPrettyConstructor(A)

      assert.isString(pretty)
      assert.strictEqual(pretty, 'A')
    })

    it('should print functions by their name', function () {
      function A () {}

      const pretty = util.printPrettyConstructor(A)

      assert.isString(pretty)
      assert.strictEqual(pretty, 'A')
    })

    it('should print anonymous classes as [anonymous class]', function () {
      const A = class {}

      const pretty = util.printPrettyConstructor(A)

      assert.isString(pretty)
      assert.strictEqual(pretty, '[anonymous class]')
    })

    it('should print anonymous functions as [anonymous fn]', function () {
      const A = function () {}

      const pretty = util.printPrettyConstructor(A)

      assert.isString(pretty)
      assert.strictEqual(pretty, '[anonymous fn]')
    })

    it('should pass through any string', function () {
      const echo = util.printPrettyConstructor('echo')
      assert.strictEqual(echo, 'echo')
    })
  })
})
