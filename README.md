# broccoli-es6-concatenator

Transpile ES6 modules and concatenate them, recursively including modules
referenced by `import` statements.

**This plugin is deprecated.** It uses an old version of
[es6-module-transpiler](https://github.com/esnext/es6-module-transpiler). The
es6-module-transpiler has since been rewritten in order to correctly reflect
ES6 module semantics. There is no hope to update broccoli-es6-concatenator to
the new es6-module-transpiler API. Somebody will have to write a new plugin
from scratch that works with the new es6-module-transpiler.

## Installation

```bash
npm install --save-dev broccoli-es6-concatenator
```

## Usage

Note: The API will change in subsequent 0.x versions.

```js
var compileES6 = require('broccoli-es6-concatenator');
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
  wrapInEval: true,
  outputFile: '/assets/application.js'
});
```

### Options

* `.wrapInEval` (boolean): Enable or disable wrapping each module in an `eval`
  call with a `//# sourceURL` comment. Defaults to true, though this may change in the future.

* `.loaderFile` (string): When specified prepends the contents of `loaderFile`.