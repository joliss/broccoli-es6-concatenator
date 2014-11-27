# master

# 0.1.11

* Enable `ignoredModules` to be a function that returns an array. This allows the
  list of ignored modules to be dynamic.

# 0.1.10

* Fix error reporting

# 0.1.9

* Improve error reporting for import errors

# 0.1.8

* Update dependency to follow symlinks correctly

# 0.1.7

* Change `.loaderFile` option to be optional (shared loaders)

# 0.1.6

* Separate concatenated files with `'\n;'`

# 0.1.5

* Make sure that module names use forward slashes on Windows as well

# 0.1.4

* Update dependencies

# 0.1.3

* Use new broccoli-writer base class

# 0.1.2

* Use broccoli-kitchen-sink-helpers instead of larger broccoli dependency

# 0.1.0

* Update dependencies

# 0.0.7

* Use `broccoli-transform` instead of `broccoli.Transformer`

# 0.0.6

* Do not require dependency-injecting broccoli
* Turn `.setWrapInEval()` into `wrapInEval` option

# 0.0.5

* Expose new functional syntax

# 0.0.4

* Add `.setWrapInEval` to configure whether to wrap modules in `eval`

# 0.0.3

* Improve performance

# 0.0.2

* Use new promise API (no actual promises are harmed in this library)

# 0.0.1

* Initial release
