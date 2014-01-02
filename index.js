module.exports = function (broccoli) {
  var fs = require('fs')
  var path = require('path')
  var mkdirp = require('mkdirp')
  var ES6Transpiler = require('es6-module-transpiler').Compiler
  var jsesc = require('jsesc')

  ES6ConcatenatorCompiler.prototype = Object.create(broccoli.Compiler.prototype)
  ES6ConcatenatorCompiler.prototype.constructor = ES6ConcatenatorCompiler
  function ES6ConcatenatorCompiler (options) {
    for (var key in options) {
      if (options.hasOwnProperty(key)) {
        this[key] = options[key]
      }
    }

    this.cache = {}
  }

  ES6ConcatenatorCompiler.prototype.compile = function (srcDir, destDir, callback) {
    var self = this
    var modulesAdded = {}
    var output = []
    // When we are done compiling, we replace this.cache with newCache, so that
    // unused cache entries are garbage-collected
    var newCache = {}

    addLegacyFile(this.loaderFile)

    var inputFiles = broccoli.helpers.multiGlob(this.inputFiles, {cwd: srcDir})
    for (var i = 0; i < inputFiles.length; i++) {
      var inputFile = inputFiles[i]
      if (inputFile.slice(-3) !== '.js') {
        throw new Error('ES6 file does not end in .js: ' + inputFile)
      }
      var moduleName = inputFile.slice(0, -3)
      addModule(moduleName)
    }

    var legacyFiles = broccoli.helpers.multiGlob(this.legacyFilesToAppend, {cwd: srcDir})
    for (i = 0; i < legacyFiles.length; i++) {
      addLegacyFile(legacyFiles[i])
    }

    broccoli.helpers.assertAbsolutePaths([this.outputFile])
    mkdirp.sync(path.join(destDir, path.dirname(this.outputFile)))
    fs.writeFileSync(path.join(destDir, this.outputFile), output.join(''))

    self.cache = newCache
    callback()

    function addModule (moduleName) {
      if (modulesAdded[moduleName]) return
      if (self.ignoredModules.indexOf(moduleName) !== -1) return
      var i
      var modulePath = moduleName + '.js'
      var fullPath = path.join(srcDir, modulePath)
      var imports
      try {
        var statsHash = broccoli.helpers.hashStats(fs.statSync(fullPath), modulePath)
        var cacheObject = self.cache[statsHash]
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
          cacheObject = {
            output: wrapInEval(compiler.toAMD(), modulePath),
            imports: compiler.imports.map(function (importNode) {
              return importNode.source.value
            })
          }
        }
        newCache[statsHash] = cacheObject
        imports = cacheObject.imports
        output.push(cacheObject.output)
        modulesAdded[moduleName] = true
      } catch (err) {
        err.file = modulePath
        throw err
      }
      for (i = 0; i < imports.length; i++) {
        var importName = imports[i]
        addModule(importName)
      }
    }

    function addLegacyFile (filePath) {
      var fileContents = fs.readFileSync(path.join(srcDir, filePath)).toString()
      output.push(wrapInEval(fileContents, filePath))
    }
  }

  function wrapInEval (fileContents, fileName) {
    // Should pull out copyright comment headers
    // Eventually we want source maps instead of sourceURL
    return "eval('" +
      jsesc(fileContents) +
      "//# sourceURL=" + jsesc(fileName) +
      "');\n"
  }

  return ES6ConcatenatorCompiler
}
