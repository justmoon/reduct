function convertSetToArray<T> (set: Set<T>): T[] {
  const arr: T[] = []
  for (let v of set) {
    arr.push(v)
  }
  return arr
}

function isClass (candidate: any): candidate is new () => Object {
  return typeof candidate === 'function' && /^\s*class\s+/.test(candidate.toString())
}

function printPrettyConstructor (key: string | Function) {
  if (typeof key === 'string') {
    return key
  }
  return key.name || (isClass(key) ? '[anonymous class]' : '[anonymous fn]')
}

export = {
  convertSetToArray,
  isClass,
  printPrettyConstructor
}
