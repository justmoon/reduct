import * as utility from './util'
import {
  IConstructor,
  IInjector,
  IInjectorPartial,
  IInstanceMap
} from './interfaces/injector'

function createContainer (
  parent?: IInjector | IInstanceMap | Object
): IInjector {
  let parentInjector: IInjectorPartial
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

  const cache: IInstanceMap = new Map()
  const mapping: Map<IConstructor, IConstructor> = new Map()
  let stack: Set<string | Function> = new Set()
  let queue: Function[] = []

  const construct = <T>(Constructor: new (injector: IInjector) => T): T => {
    const OverrideConstructor = mapping.get(Constructor)
    return new (OverrideConstructor || Constructor)(reduct as IInjector) as T
  }

  const reduct: IInjectorPartial = <T>(Constructor: new (injector: IInjector) => T): T => {
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
      parentInjector(Constructor) ||   // Then try the parent SinjectorS
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

  reduct.setOverride = (Constructor: IConstructor, OverrideConstructor: IConstructor) => {
    mapping.set(Constructor, OverrideConstructor)
  }
  reduct.later = (fn: Function) => queue.push(fn)

  return reduct as IInjector
}

export = createContainer

namespace createContainer {
  export let util = utility
}

declare namespace createContainer {
  export type Constructor = IConstructor
  export type Injector = IInjector
  export type InstanceMap = IInstanceMap
}
