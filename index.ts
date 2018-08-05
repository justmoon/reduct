import * as utility from './util'

export type Injector = {
  <T>(Constructor: new(injector: Injector) => T): T
  later: (fn: Function) => number
  setOverride: (Constructor: Function, instance: any) => void
}

export type InjectorPartial = {
  <T>(Constructor: new(injector: Injector) => T): (T | undefined)
  later?: (fn: Function) => number
  setOverride?: (Constructor: Function, instance: any) => void
}

export interface Constructor {
  new (injector: Injector): Object
}

export interface InstanceMap extends Map<Constructor, any> {
  get<T> (key: new(injector: Injector) => T): T | undefined
  set<T> (key: new(injector: Injector) => T, value: T): this
}

interface MainExport {
  (parent?: Injector | InstanceMap | Object): Injector
  default: MainExport
  util: typeof utility
}

const createContainer = function (
  parent?: Injector | InstanceMap | Object
) {
  let parentInjector: InjectorPartial
  // Convenience: If a Map is passed as a parent injector, convert it
  if (parent instanceof Map) {
    parentInjector = key => parent.get(key)
  // Convenience: If an object is passed as a parent injector, convert it
  } else if (typeof parent === 'object') {
    parentInjector = key => parent[key.name]
  } else if (typeof parent === 'function') {
    parentInjector = parent
  } else if (typeof parent === 'undefined') {
    parentInjector = () => undefined
  } else {
    throw new TypeError('Parent injector must be a Map, object or function')
  }

  const cache: InstanceMap = new Map()
  const mapping: Map<Constructor, Constructor> = new Map()
  let stack: Set<string | Function> = new Set()
  let queue: Function[] = []

  const construct = <T>(Constructor: new (injector: Injector) => T): T => {
    const OverrideConstructor = mapping.get(Constructor)
    return new (OverrideConstructor || Constructor)(reduct as Injector) as T
  }

  const reduct: InjectorPartial = <T>(Constructor: new (injector: Injector) => T): T => {
    if (typeof Constructor !== 'function') {
      throw new TypeError('Dependencies must be constructors/factories, but got: ' + typeof Constructor)
    }

    if (stack.has(Constructor)) {
      const stackArray = utility.convertSetToArray(stack)
      stackArray.push(Constructor)
      const prettyStack = stackArray.map(utility.printPrettyConstructor).join(' => ')
      throw new Error('Circular dependency detected: ' + prettyStack)
    }

    // First, check for an already cached instance
    const cachedInstance = cache.get(Constructor) as T
    if (cachedInstance) {
      return cachedInstance
    }

    stack.add(Constructor)

    const instance =
      parentInjector(Constructor) ||   // Then try the parent injector
      construct(Constructor)           // Finally, construct a new instance

    stack.delete(Constructor)

    // Cache the instance
    cache.set(Constructor, instance)

    // Run any registered post-constructors
    if (queue.length) {
      stack.add(utility.printPrettyConstructor(Constructor) + ' (post)')
      const lastQueue = queue
      queue = []
      lastQueue.forEach((fn) => fn())
    }

    return instance
  }

  reduct.setOverride = (Constructor: Constructor, OverrideConstructor: Constructor) => {
    mapping.set(Constructor, OverrideConstructor)
  }
  reduct.later = (fn: Function) => queue.push(fn)

  return reduct as Injector
} as MainExport

createContainer.default = createContainer
createContainer.util = utility
export default createContainer

module.exports = createContainer
