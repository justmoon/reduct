export type IInjector = {
  <T>(Constructor: new(injector: IInjector) => T): T
  later: (fn: Function) => number
  setOverride: (Constructor: Function, instance: any) => void
}
export type IInjectorPartial = {
  <T>(Constructor: new(injector: IInjector) => T): (T | undefined)
  later?: (fn: Function) => number
  setOverride?: (Constructor: Function, instance: any) => void
}
export interface IConstructor {
  new (injector: IInjector): Object
}
export interface IInstanceMap extends Map<IConstructor, Object> {
  get<T> (key: new(injector: IInjector) => T): T
  set<T> (key: new(injector: IInjector) => T, value: T): this
}
