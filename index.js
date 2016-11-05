
const fs = require('fs')
const pathUtils = require('path')
const callerPath = require('caller-path')

const fileUtils = require('file')

const toposort = require('toposort')

const beautify = require('js-beautify').js_beautify

/******************************************************************************/

let require_regex = /\/\/\s*require\s+(.+?)$/gm

/******************************************************************************/

function normalizeFilePath(base, path) {
    return pathUtils.normalize(pathUtils.resolve(base, path))
}

function normalizeDirPath(base, path) {
    return normalizeFilePath(base, path) + '/'
}



let getFileContent = function(absPath) {
    return fs.readFileSync(absPath, "utf-8")
}



function getDirectDependencies(absFilePath, sourceCode) {
    let deps = []

    let base = normalizeDirPath(pathUtils.dirname(absFilePath), '')

    require_regex.lastIndex = 0 // reset for .exec()
    let matches
    while (matches = require_regex.exec(sourceCode)) {
        let relFilePath = matches[1]
        if (!relFilePath.endsWith('.js')) relFilePath += '.js'
        deps.push(normalizeFilePath(base, relFilePath))
    }

    return deps
}



class FileGraph {

    constructor(...absPaths) {
        this.list = {}
        this.addWithAllDependencies(...absPaths)
    }

    addWithAllDependencies(...absPaths) {
        let nodes = []
        for (let i = 0; i < absPaths.length; ++i) {
            let absPath = absPaths[i]
            if (!this.list[absPath]) {
                let content = getFileContent(absPath)
                this.list[absPath] = {
                    absPath : absPath,
                    content : content
                }
                this.list[absPath].deps = this.addWithAllDependencies(...getDirectDependencies(absPath, content))
            }
            nodes.push(this.list[absPath])
        }
        return nodes
    }

    getAsArray() {
        let arr = []

        for (var path in this.list) {
            if (!this.list.hasOwnProperty(path)) continue

            arr.push(this.list[path])
        }

        return arr
    }

    generateEdges() {
        let edges = []

        for (var path in this.list) {
            if (!this.list.hasOwnProperty(path)) continue

            let file = this.list[path]

            for (let i = 0; i < file.deps.length; ++i) {
                edges.push( [file, file.deps[i]] )
            }
        }

        return edges
    }

}



function getConcatOrderFromFileList(absPaths) {
    let fileGraph = new FileGraph(...absPaths)
    return toposort.array(fileGraph.getAsArray(), fileGraph.generateEdges()).reverse()
}

/******************************************************************************/

function bundle(options = {}) {

    let base = options.dir || pathUtils.resolve(pathUtils.dirname(callerPath()))

    let concatOrder = []

    if (options.entry) {
        concatOrder = getConcatOrderFromFileList( [ normalizeFilePath(base, options.entry) ] )
    } else if (options.files) {
        let fileList = []
        for (let i = 0; i < options.files.length; ++i) {
            fileList.push(normalizeFilePath(base, options.files[i]))
        }
        concatOrder = getConcatOrderFromFileList(fileList)
    } else if (options.dir) {
        let fileList = []
        fileUtils.walkSync(normalizeDirPath(base, options.dir), function(dirPath, dirs, files) {
            for (let i = 0; i < files.length; ++i) {
                if (files[i].endsWith('.js'))
                    fileList.push(normalizeFilePath(base, pathUtils.resolve(base, dirPath, files[i])))
            }
        })
        concatOrder = getConcatOrderFromFileList(fileList)
    }


    let concatenatedSource = ''

    for (let i = 0; i < concatOrder.length; ++i) {
        concatenatedSource += concatOrder[i].content.replace(require_regex, '')
    }

    if (options.target && options.target == 'module') {
        // BUNDLE AS COMMONJS MODULE

        if (options.export) {
            concatenatedSource += '\nmodule.exports = ' + options.export + ';'
        } else if (options.exposed) {
            concatenatedSource += '\nmodule.exports = {'
            for (let i = 0; i < options.exposed.length; ++i) {
                if (i != 0) concatenatedSource += ','
                concatenatedSource += options.exposed[i] + ':' + options.exposed[i]
            }
            concatenatedSource += '}'
        }
        if (options.iife)
            concatenatedSource = '(function(){' + concatenatedSource + '})();'

    } else if (options.target && options.target == 'browser') {
        // BUNDLE FOR BROWSER

        if (options.exposed) {
            for (let i = 0; i < options.exposed.length; ++i) {
                concatenatedSource += '\nwindow.' + options.exposed[i] + ' = ' + options.exposed[i] + ';'
            }
        } else if (options.export) {
            concatenatedSource += '\nwindow.' + options.export + ' = ' + options.export + ';'
        }
        if (options.iife == undefined || options.iife)
            concatenatedSource = '(function(){' + concatenatedSource + '})();'

    } else if (options.export) {
        concatenatedSource += '\nreturn ' + options.export + ';'
        concatenatedSource = 'var ' + options.export + ' = (function(){' + concatenatedSource + '})();'
    } else if (options.iife) {
        concatenatedSource = '(function(){' + concatenatedSource + '})();'
    }

    concatenatedSource = beautify(concatenatedSource, { indent_size: 4 })

    if (options.dest) {
        let dest = normalizeFilePath(base, options.dest)
        if (!fs.existsSync(pathUtils.dirname(dest)))
            fs.mkdirSync(pathUtils.dirname(dest))
        fs.writeFileSync(dest, concatenatedSource, { encoding: "utf-8" })
    } else {
        process.stdout.write(concatenatedSource)
    }

    return concatenatedSource
}

/******************************************************************************/

module.exports = bundle
