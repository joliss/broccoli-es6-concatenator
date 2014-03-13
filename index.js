var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var ES6Transpiler = require('es6-module-transpiler').Compiler
var jsStringEscape = require('js-string-escape')
var helpers = require('broccoli-kitchen-sink-helpers')
var Transform = require('broccoli-transform')

module.exports = ES6Concatenator
ES6Concatenator.prototype = Object.create(Transform.prototype)
ES6Concatenator.prototype.constructor = ES6Concatenator
function ES6Concatenator(inputTree, options) {
  if (!(this instanceof ES6Concatenator)) return new ES6Concatenator(inputTree, options)
  Transform.call(this, inputTree)
  for (var key in options) {
    if (options.hasOwnProperty(key)) {
      this[key] = options[key]
    }
  }

  this.cache = {
    es6: {},
    legacy: {}
  }
}

ES6Concatenator.prototype.getWrapInEval = function () {
  // default to true for now
  return this.wrapInEval == null ? true : this.wrapInEval
}

ES6Concatenator.prototype.transform = function (srcDir, destDir) {
  var self = this
  var modulesAdded = {}
  var output = []
  // When we are done compiling, we replace this.cache with newCache, so that
  // unused cache entries are garbage-collected
  var newCache = {
    es6: {},
    legacy: {}
  }

  addLegacyFile(this.loaderFile)

  // This glob tends to be the biggest performance hog
  var inputFiles = helpers.multiGlob(this.inputFiles, {cwd: srcDir})
  for (var i = 0; i < inputFiles.length; i++) {
    var inputFile = inputFiles[i]
    if (inputFile.slice(-3) !== '.js') {
      throw new Error('ES6 file does not end in .js: ' + inputFile)
    }
    var moduleName = inputFile.slice(0, -3)
    addModule(moduleName)
  }

  if (this.legacyFilesToAppend && this.legacyFilesToAppend.length) {
    var legacyFiles = helpers.multiGlob(this.legacyFilesToAppend, {cwd: srcDir})
    for (i = 0; i < legacyFiles.length; i++) {
      addLegacyFile(legacyFiles[i])
    }
  }

  helpers.assertAbsolutePaths([this.outputFile])
  mkdirp.sync(path.join(destDir, path.dirname(this.outputFile)))
  fs.writeFileSync(path.join(destDir, this.outputFile), output.join(''))

  self.cache = newCache
  // This method is synchronous, so we don't need to return a promise here

  function addModule (moduleName) {
    if (modulesAdded[moduleName]) return
    if (self.ignoredModules && self.ignoredModules.indexOf(moduleName) !== -1) return
    var i
    var modulePath = moduleName + '.js'
    var fullPath = srcDir + '/' + modulePath
    var imports
    try {
      var statsHash = helpers.hashStats(fs.statSync(fullPath), modulePath)
      var cacheObject = self.cache.es6[statsHash]
      if (cacheObject == null) { // cache miss
        var fileContents = fs.readFileSync(fullPath).toString()
        var compiler = new ES6Transpiler(fileContents, moduleName)
        // Resolve relative imports by mutating the compiler's list of import nodes
        for (i = 0; i < compiler.imports.length; i++) {
          var importNode = compiler.imports[i]
          if ((importNode.type !== 'ImportDeclaration' &&
               importNode.type !== 'ModuleDeclaration') ||
            !importNode.source ||
            importNode.source.type !== 'Literal' ||
            !importNode.source.value) {
            throw new Error('Internal error: Esprima import node has unexpected structure')
          }
          // Mutate node
          if (importNode.source.value.slice(0, 1) === '.') {
            importNode.source.value = path.join(moduleName, '..', importNode.source.value)
          }
        }
        var compiledModule = compiler.toAMD()
        if (self.getWrapInEval()) {
          compiledModule = wrapInEval(compiledModule, modulePath)
        }
        cacheObject = {
          output: compiledModule,
          imports: compiler.imports.map(function (importNode) {
            return importNode.source.value
          })
        }
      }
      newCache.es6[statsHash] = cacheObject
      imports = cacheObject.imports
      output.push(cacheObject.output)
      modulesAdded[moduleName] = true
    } catch (err) {
      // Bug: When a non-existent file is referenced, this is the referenced
      // file, not the parent
      err.file = modulePath
      throw err
    }
    for (i = 0; i < imports.length; i++) {
      var importName = imports[i]
      addModule(importName)
    }
  }

  function addLegacyFile (filePath) {
    // This function is just slow enough that we benefit from caching
    var statsHash = helpers.hashStats(fs.statSync(srcDir + '/' + filePath), filePath)
    var cacheObject = self.cache.legacy[statsHash]
    if (cacheObject == null) { // cache miss
      var fileContents = fs.readFileSync(srcDir + '/' + filePath, { encoding: 'utf8' })
      if (self.getWrapInEval()) {
        fileContents = wrapInEval(fileContents, filePath)
      }
      cacheObject = {
        output: fileContents
      }
    }
    newCache.legacy[statsHash] = cacheObject
    output.push(cacheObject.output)
  }
}

function wrapInEval (fileContents, fileName) {
  // Should pull out copyright comment headers
  // Eventually we want source maps instead of sourceURL
  return 'eval("' +
    jsStringEscape(fileContents) +
    '//# sourceURL=' + jsStringEscape(fileName) +
    '");\n'
}
