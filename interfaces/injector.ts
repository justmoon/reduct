export type IInjector = {
  <T>( Constructor: new(injector: IInjector) => T ): T
  later: (fn: Function) => number
}
export type IInjectorPartial = {
  <T>( Constructor: new(injector: IInjector) => T ): T
  later?: (fn: Function) => number
}
export interface IConstructor<T> {
  new (injector: IInjector): T
}