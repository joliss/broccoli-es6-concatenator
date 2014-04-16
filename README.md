# broccoli-es6-concatenator

Transpile ES6 modules and concatenate them, recursively including modules
referenced by `import` statements.

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
* `.moduleNameToPath` (function): Provide a function that returns the path on disk for a
  given ES6 module name.
* `.pathToModuleName` (function): Provide a function to use a custom mapping from path on disk to
  ES6 module name.
