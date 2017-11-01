# bundle-js

Bundle your inter-dependent Javascript files in the correct order

Install:

    npm install -g bundle-js

## What It Does

Concatenates your Javascript files.

Just add require comments (`// require ./dependecy.js`) or (`// include ./inc/smallfile.js`) to your files and bundle-js will automatically concatenate every file that is needed by every file into one single bundled script.

It uses [topological sorting](https://en.wikipedia.org/wiki/Topological_sorting) to determine the order in which to concatenate so you don't have to worry about having anything undefined. However, as a result of this, bundle-js does **NOT support circular dependencies**.

The output is a single JS script that can be written to an output file.

## Usage

Within your javascript files you can use comments to indicate what external files are needed by the current file.

+ Using `// require ./path/to/file.js` ensures that the "required" file comes before the current file in the final concatenated output. Use this when developing multi-file Javascript without any module loaders.
+ Using `// include ./path/to/file.js` includes the entirety of the file directly at the location of the comment. Useful for including small snippets of code within other code. *Note: a file that is `require`-ed within a file that is `include`-ed, will still be placed at the top level of the bundled file. See `include_b` to avoid this behavior.*
+ Using `// include_b ./path/to/file.js` includes the entirety of the file **pre-bundled** directly at the location of the comment. This is useful for wrapping an entire project in something such as an [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/) or to compile to a specific target such as for the browser or a node module.

**Circular dependencies are not allowed (neither for requires or includes).**

In order to require or include a file, you must begin the file path with `./`, `../`, or `/`. Otherwise, it will search for a node module. This is because file resolution is done using the [resolve module](https://www.npmjs.com/package/resolve), which implements the behavior of Node's `require.resolve()` ([more information here](https://nodejs.org/api/modules.html#modules_all_together)).

*Note: These are not case sensitive (ie. you can freely use `REQUIRE`, `INCLUDE`, `INCLUDE_B`)*

### Options:

+ **entry**: (required) the "entry point" - a single file path to start finding the dependencies from recursively
+ **dest**: (optional) the output file path
+ **print**: (optional) prints the output file to stdout if set to true
+ **disable-beautify**: (optional) bundle-js by default runs the final output through beautify; set this to true to disable this behavior

### Command line:

    Usage: bundle-js ./path/to/entryfile.js [-o ./path/to/outputfile] [-p]
           [--disable-beautify]

    Options:
      -o, --out, --dest   Output file                                          [default: "./bundlejs/output.js"]
      -p, --print         Print the final bundled output to stdout
      --disable-beautify  Leave the concatenated files as-is (might be ugly!)

### Programmatic:

    const bundle = require('bundle-js')
    let output = bundle({ entry : './index.js' })

Configuration options:

    bundle({
        entry : './index.js',
        dest : './bundle.js',
        print : false,
        disablebeautify : false
    })

## Simple Example

If in file `A.js` you have

    // require ./B.js
    console.log(b + ' world!');

and in file `B.js`

    var b = 'Hello';

The final output is going to look like this

    var b = 'Hello';
    console.log(b + ' world!');

## Wrapper Example

In file `index.js` you have

    // require ./dep.js
    // some code

in file `dep.js`

    // this is a dependency

Using `wrapper1.js`

    (function() {
        // include ./index.js
    })();

Will result in

    // this is a dependency
    (function() {
        // some code
    })();

However, using `wrapper2.js`

    (function() {
        // include_b ./index.js
    })();

Will result in

    (function() {
        // this is a dependency
        // some code
    })();

## License

[MIT License](LICENSE)
