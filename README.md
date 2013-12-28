# broccoli-es6-concatenator

The `ES6ConcatenatorCompiler` transpiles ES6 modules and concatenates them,
recursively including modules referenced by `import` statements.

## Usage

Note: The API will change in subsequent 0.x versions.

```js
var ES6ConcatenatorCompiler = require('broccoli-es6-concatenator')(broccoli);
compilerCollection.addCompiler(new ES6ConcatenatorCompiler({
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
    'ember-data.js',
    'ember-resolver.js'
  ],
  outputFile: '/assets/app.js'
}));
```
