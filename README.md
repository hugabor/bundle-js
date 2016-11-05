# bundle-js

Bundle your JavaScript projects for either the browser or Node.js

Install:

    npm install -g bundle-js

## What It Does

Concatenates your .js files.

Just add require comments (`// require dependecy.js`) to the top of your files and bundle-js will automatically concatenate every file that is needed by every file into one single bundled script.

It uses [topological sorting](https://en.wikipedia.org/wiki/Topological_sorting) (with [toposort](https://www.npmjs.com/package/toposort)) to determine the order in which to concatenate so you don't have to worry about having anything undefined. However, as a result of using topological sorting, bundle-js does **NOT support circular dependencies**.

You can either specify a single file to be an entry point, or you can provide a list of files to concatenate, or you can just provide a single directory to find all .js files in.

The output is a single js script that can optionally be written to a specified output file.

You may choose to bundle for the browser, in which case the output is wrapped in an [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/) and your specified exported fields are attached to the `window`. You may choose to bundle as a CommonJS module, in which case your specified exported fields will be attached to `module.exports`.

## Usage

### Options:

+ **dir**: the directory within which to look for files and to find relative file paths within
+ **entry**: the "entry point" - a single file path to start reading the dependencies from recursively
+ **files**: an array of file paths to bundle
+ **target**: the target environment; can be either `'module'` or `'browser'`
+ **exposed**: an array of the names of the fields exposed by your module. If `target: 'module'`, it builds an object and assigns it to `module.exports`. If `target: 'browser'`, it attaches each field to the `window` object.
+ **export**: the field your module exports. (Only applies when the `target: 'module'` or when `target` is not defined but `name` is)
+ **iife**: whether or not to wrap the output in an [IIFE](http://benalman.com/news/2010/11/immediately-invoked-function-expression/). By default `false` when `target: 'module'` and `true` when `target: 'browser'`.
+ **name**: the name to give the IIFE that wraps the output. (Only applies when `target` is not defined.)
+ **dest**: the output file path. If not defined, writes to stdout.

If neither `entry` nor `files` is defined, all of the .js files from `dir` are processed.

### Command line:

    bundle-js

Optional flags to append to command:

+ `dir=...` sets `dir` option
+ `entry=...` sets `entry` option
+ `target=...` sets `target` option
+ `exposed=...` sets `exposed` option to an array of a single element (Using the command line, this only accepts a single file path.)
+ `export=...` sets `export` option
+ `--iife` sets `iife` option as true
+ `out=...` sets `dest` option
+ `name=...` sets `name` option

### Programmatic:

    const bundle = require('bundle-js')    
    bundle({ entry : './file.js' })

Configuration options:

    bundle({
        entry : './file.js',
        dest : './build/bundle.js',
        dir : 'myPrefix_',
        files : ['./file1.js', 'file2.js', './path/to/file.js'],
        target : 'browser',
        exposed : ['Object1', 'Object2', 'Object3'],
        export : 'MainObject',
        name : 'browser',
        iife : true
    })

(Note: Some of these configuration options cancel each other out, this is just a list of possible fields.)

## Simple Example

Eg. If in file A you have

    var a = 'hello';

then you can do in file B:

    //require A
    console.log(a + ' world');

## Example Use Case

Suppose we have the following files:

File `a.js`:

    // require b.js

    console.log("Does it work? :", getText());

    var MyPackage = {

        func1 : function() {
            return getText();
        },
        func2 : function(prefix) {
            return prefix + MyPackage.func1();
        }

    };

File `b.js`

    var getText = function() {
        return "Hello, I am b.js";
    };

Then, if we run the following command:

    bundle-js entry=a.js target=browser exposed=MyPackage

We get the following ouput:

    (function() {
        var getText = function() {
            return "Hello, I am b.js";
        };


        console.log("Does it work? :", getText());

        var MyPackage = {

            func1: function() {
                return getText();
            },
            func2: function(prefix) {
                return prefix + MyPackage.func1();
            }

        };

        window.MyPackage = MyPackage;
    })();

## License

[MIT License](LICENSE)
