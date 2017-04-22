# Reduct [![npm][npm-image]][npm-url] [![travis][travis-image]][travis-url] [![codecov][codecov-image]][codecov-url]

[npm-image]: https://img.shields.io/npm/v/reduct.svg?style=flat
[npm-url]: https://npmjs.org/package/reduct
[travis-image]: https://travis-ci.org/justmoon/reduct.svg
[travis-url]: https://travis-ci.org/justmoon/reduct
[codecov-image]: http://codecov.io/github/justmoon/reduct/coverage.svg?branch=master
[codecov-url]: http://codecov.io/github/justmoon/reduct?branch=master

> Functional Dependency Injection (DI) for JavaScript

Reduct is a simple (<100 lines) caching, functional dependency injector. It lets you eliminate a lot of boilerplate from your code, simplifies mocking (without ugly `require` hacks) and allows you to run multiple instances of your app in the same process.

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
import memoize from 'lodash/memoize'

// Use ES6 Map to ensure keys meet strict equality (rather than string coercion)
memoize.Cache = Map
const injector = memoize(Constructor => new Constructor(injector))
```

That's it. `reduct` has a few more features than this minimalist injector which are described below.

## Usage

### Creating an injector

If you call `reduct()` without arguments, `reduct` will return a new injector with an empty cache.

``` js
import reduct from 'reduct'

const injector = reduct()
```

### Constructing objects

If you call `reduct()(A)`, `reduct` will create a new injector and construct an instance of `A`. Whenever an injector constructs an object, it passes itself as the first and only parameter. In this case, there is no constructor, so the object is simply instantiated and returned.

``` js
import reduct from 'reduct'

class A {}

const a = reduct()(A)
console.log(a instanceof A) // => true
```

When an class does have dependencies, it's easy to retrieve them by calling the injector (usually called `deps`). The injector will automatically create instances of any classes that it hasn't instantiated before.

``` js
import reduct from 'reduct'

class A {}
class B {
  constructor (deps) {
    const a = deps(A)

    console.log(a instanceof A) // => true
  }
}

const b = reduct()(B)
console.log(b instance of B) // => true
```

### Override classes

For testing it's often useful to override a specific class with another (mock) class. This can be achieved by calling the `setOverride` method on the injector.

For example:

``` js
import reduct from 'reduct'

// Your app code
class Database {}

class App {
  constructor (deps) {
    this.database = deps(Database)
  }
}

// Your test code
class MockDatabase {}

const deps = reduct()
deps.setOverride(Database, MockDatabase)
const app = deps(App)

console.log(app.database.constructor.name) // => 'MockDatabase'
```

Note that override classes can have dependencies like any other class.

### Parent injectors

You can pass another injector to `reduct` which will be consulted first. Only if this parent injector returns a falsy value will `reduct` attempt to construct the object itself.

Here is an example of a parent injector:

``` js
const app = reduct(Constructor => console.log(Constructor.name))(App)
```

Since the parent injector will always be called when `reduct` tries to instantiate a class and because `console.log` always returns `undefined`, this will simply log all classes' names before instantiation.

As a convenience, `reduct` will automatically convert Maps and objects into injector functions:

``` js
const app = reduct({ Database: CustomDatabase })(App)
```

This is great for mocking/overriding specific classes in unit tests.

> **Note:** Objects use string keys, meaning the above will override all classes with the name `'Database'`. It's also brittle and will break when minified. If you want to override a class by reference instead of by name, use a `Map`:
>
> ``` js
> const depMap = new Map()
> depMap.set(Database, new MockDatabase())
> const app = reduct(depMap)(App)
> ```

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

### Circular references

Dependency injection makes circular references more explicit and therefore safer than vanilla ES6 or CommonJS.

If two classes depend on each other, you can define a method to be executed right after the constructor. Any class you depend on within the post-constructor can be successfully instantiated even if it depends on your class, because your class is already cached at this point.

You can register a post-constructor using `deps.later`. Post-constructors will be executed synchronously immediately after the constructor and before your instance is returned to whoever requested it.

> **Caution:** Other classes may interact with your class in their constructor (or post-constructor) before your post-constructor has completed, but only in their constructor and only if your post-constructor directly or indirectly depended on them.

``` js
class A {
  constructor (deps) {
    deps.later(() => {
      this.b = deps(B)
    })
  }
}

class B {
  constructor (deps) {
    deps.later(() => {
      this.a = deps(A)
    })
  }
}

const a = reduct()(A)
console.log(a === a.b.a) // => true
```

> **Tip:** You could use this feature to create database models that have mutual relations.

> **Caution:** You can have two classes depend on each other symmetrically like the example above or you can have only one of them use a post-constructor. However, in the asymmetric case, the class without a post-constructor must be instantiated last.

### Migrating from an older version

Please see [MIGRATING.md](docs/MIGRATING.md).
