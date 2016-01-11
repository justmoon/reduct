# Reduct [![npm][npm-image]][npm-url] [![travis][travis-image]][travis-url] [![codecov][codecov-image]][codecov-url]

[npm-image]: https://img.shields.io/npm/v/reduct.svg?style=flat
[npm-url]: https://npmjs.org/package/reduct
[travis-image]: https://travis-ci.org/justmoon/reduct.svg
[travis-url]: https://travis-ci.org/justmoon/reduct
[codecov-image]: http://codecov.io/github/justmoon/reduct/coverage.svg?branch=master
[codecov-url]: http://codecov.io/github/justmoon/reduct?branch=master

> Functional Dependency Injection (DI) for JavaScript

Reduct is a simple (~50 lines) caching, functional dependency injector. It lets you eliminate a lot of boilerplate from your code, simplifies mocking (without ugly `require` hacks) and allows you to run multiple instances of your app in the same process.

> **Trivia:** Reduct was inspired by [Redux](https://github.com/rackt/redux)' simplistic, functional approach.

## What is Functional Dependency Injection?

Functional Dependency Injection is when a constructor (or factory) accepts an injector function as its only argument. It's easiest to explain by example:

``` js
const Log = require('./log')
const DB = require('./db')

class Router {
  constructor (deps) {
    this.log = deps(Log)
    this.db = deps(DB)
  }
}
```

## Basic injector

To instantiate a class like that, we need an *injector*. The simplest injector is:

``` js
const injector = Constructor => new Constructor(injector)
```

You can already use it to instantiate entire trees of classes:

``` js
const router = new Router(injector)
```

But as-is, it won't cache any instances. So let's memoize it:

``` js
import _ from 'lodash'

// Use ES6 Map to ensure keys meet strict equality (rather than string coercion)
_.memoize.Cache = Map
const injector = _.memoize(Constructor => new Constructor(injector))
```

That's basically it. `reduct` does this for you and adds some conveniences which are described below.

## Usage

### Creating an injector

If you call `reduct()` without arguments, `reduct` will return a new injector with an empty cache.

``` js
import reduct from 'reduct'

const injector = reduct()
```

### Constructing objects

If you call `reduct(Constructor)`, `reduct` will create a new injector and pass it to the `Constructor`. Then, it will return the new instance of `Constructor`.

``` js
import reduct from 'reduct'

class A {}

const a = reduct(A)
console.log(a instanceof A) // => true
```

### Parent injectors

You can pass another injector to `reduct` which will be consulted first. Only if this parent injector returns a falsy value will `reduct` attempt to construct the object itself.

If you need to override something for a test, you can use a parent injector:

``` js
const depMap = new Map()
depMap.set(Database, new MockDatabase)
const app = reduct(App, ::depMap.get)
```

> **Tip:** `::depMap.get` is ES7 syntax for `depMap.get.bind(depMap)`

As a convenience, `reduct` will automatically convert Maps and objects into injector functions:

``` js
const app = reduct(App, { Database: CustomDatabase })
```

> **Note:** Objects use string keys, meaning the above will override all classes with the name `'Database'`. If you only want to override a specific class (by reference instead of by name), use a `Map`:

``` js
const depMap = new Map()
depMap.set(Database, new MockDatabase())
const app = reduct(App, depMap)
```

### Shorthand

In order to save you some typing, `reduct` also provides a shorthand syntax.

Instead of this:

``` js
class Example {
  constructor (deps) {
    this.a = deps(A)
    this.b = deps(B)
    this.c = deps(C)
  }
}
```

You can also write:

``` js
class Example {
  constructor (deps) {
    deps(this, A, B, C)
  }
}
```

When using the shorthand, reduct will guess the name of the variable you want to set by taking the class name (presumably in `CamelCase`) and converting it to `mixedCase`. Here are some examples:

* `Log` => `this.log`
* `RequestRouter` => `this.requestRouter`
* `DB` => `this.db`
* `HTTPRequest` => `this.httpRequest`

> **Caveat:** Unfortunately, it is impossible to distinguish two consecutive uppercase words in a `CamelCase` token, so `XMLHTTPRequest` becomes `xmlhttpRequest`.

You can always override the name by using the normal injector syntax:

``` js
deps(this, Log, DB, RequestRouter)
this.xmlHttpRequest = deps(XMLHTTPRequest)
```

> **Tip:** Keep in mind that using the shorthand breaks the basic injector pattern, so avoid it in libraries.

### Using reduct as a default injector

When writing a library you can easily use reduct as a default injector:

``` js
import reduct from 'reduct'

class Library {
  constructor (deps) {
    deps = deps || reduct()
  }
}
```

> **Tip:** `reduct()` will return a new injector with an empty cache.

### Module not required in libraries

If you are writing a library and you are comfortable exporting the injector pattern, you don't need to depend on reduct at all:

``` js
import Database from './database'

class AwesomeLibraryClass {
  constructor (deps) {
    this.db = deps(Database)
  }
}
```
