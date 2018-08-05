'use strict'

const util = require('..').util
const assert = require('chai').assert

describe('util', function () {
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
      function A () { return }

      const pretty = util.printPrettyConstructor(A)

      assert.isString(pretty)
      assert.strictEqual(pretty, 'A')
    })

    it('should print anonymous classes as [anonymous class]', function () {
      const pretty = util.printPrettyConstructor(
        class {}
      )

      assert.isString(pretty)
      assert.strictEqual(pretty, '[anonymous class]')
    })

    it('should print anonymous functions as [anonymous fn]', function () {
      const pretty = util.printPrettyConstructor(function () { return })

      assert.isString(pretty)
      assert.strictEqual(pretty, '[anonymous fn]')
    })

    it('should pass through any string', function () {
      const echo = util.printPrettyConstructor('echo')
      assert.strictEqual(echo, 'echo')
    })
  })
})
