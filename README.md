# broccoli-es6-concatenator

Transpile ES6 modules and concatenate them, recursively including modules
referenced by `import` statements.

## Usage

Note: The API will change in subsequent 0.x versions.

```js
var compileES6 = require('broccoli-es6-concatenator')(broccoli);
var applicationJs = compileES6(sourceTree, {
  loaderFile: 'loader.js',
  ignoredModules: [
    'resolver'
  ],
  inputFiles: [
    'todomvc/**/*.js'
  ],
  legacyFilesToAppend: [
    'jquery.js',
    'handlebars.js',
    'ember.js',
  ],
  outputFile: '/assets/application.js'
});
```

### Methods

* `.setWrapInEval(bool)`: Call with `true` or `false` to enable or disable
  wrapping each module in an `eval` call with a `//# sourceURL` comment.
  Defaults to true, though this may change in the future.
