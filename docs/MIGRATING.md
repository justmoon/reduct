# From 2.x.x

If you're migrating from reduct 2.x.x, please note that the function signature for `createReduct` (the module's main export) has changed.

##### Reduct 2.x.x

``` js
reduct(Constructor?, parent?) // returns injector or instance
```

##### Reduct 3.x.x

``` js
reduct(parent?) // returns injector
```

That means that if you were using the shorthand to create an instance directly, you have to change your code like so:

##### Reduct 2.x.x

``` js
reduct(App) // returns an App object
```

##### Reduct 3.x.x

``` js
reduct()(App) // returns an App object
```

## Rationale

In Reduct 2.x.x, depending on the arguments, `reduct` would sometimes return an injector and sometimes an object instance. This made it more difficult to understand and more error-prone. Now, `reduct` always returns an injector and injectors always return object instances, making the interface overall much simpler. 