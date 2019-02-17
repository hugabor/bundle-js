const fs = require('fs')
const path = require('path')
const resolve = require('resolve')
const beautify = require('js-beautify').js_beautify


const ENCODING = 'utf-8'

function REQUIRE_REGEX() {
    return new RegExp(/\/\/+\s*REQUIRE\s+([^\s\n]+)/, "gi")
}
function INCLUDE_REGEX() {
    return new RegExp(/\/\/+\s*INCLUDE\s+([^\s\n]+)/, "gi")
}
function INCLUDEB_REGEX() {
    return new RegExp(/\/\/+\s*INCLUDE_?B\s+([^\s\n]+)/, "gi")
}


function concatFiles(files) {
    let concatenated = ''

    for (let file of files) {
        concatenated += file.getFinalContent()
        concatenated += '\n\n'
    }

    return concatenated
}

class File {
    constructor(filepath, basedir = process.cwd()) {
        this.absolutefilepath = File.resolve(filepath, basedir)
        this.dependentfiles = []

        this._generated = false

        this.tempmark = false
        this.permmark = false

        this._contentwithincludes = null
    }

    readFile() {
        return fs.readFileSync(this.absolutefilepath, 'utf-8')
    }

    getContentWithIncludes(existingfiles = [], ancestorincludes = []) {
        if (this._contentwithincludes != null) {
            return this._contentwithincludes
        }

        // Check for cyclical inclusions
        ancestorincludes.forEach((file) => {
            if (this.absolutefilepath == file.absolutefilepath) {
                throw new Error('Ran into cyclical inclusion! Cannot INCLUDE file within itself: ' + this.absolutefilepath)
            }
        })

        this._contentwithincludes = this.readFile();

        // Return contents with INCLUDE statements replaced with the inclusions
        this._contentwithincludes = this._contentwithincludes.replace(INCLUDE_REGEX(), (m, p) => {
            let includedfile = this.getRelativeFile(p, existingfiles)
            return includedfile.getContentWithIncludes(existingfiles, ancestorincludes.concat([this]))
        })
        this._contentwithincludes = this._contentwithincludes.replace(INCLUDEB_REGEX(), (m, p) => {
            let includedfile = this.getRelativeFile(p)
            return bundle(includedfile.absolutefilepath, { disablebeautify: true })
        })
        return this._contentwithincludes
    }

    getFinalContent() {
        if (this._contentwithincludes == null) {
            throw new Error('An unknown error occured (_contentwithincludes was null)')
        }

        return this._contentwithincludes.replace(REQUIRE_REGEX(), () => '')
    }

    addDependentFile(file) {
        for (let dependentfile of this.dependentfiles) {
            if (file.absolutefilepath == dependentfile.absolutefilepath) {
                return
            }
        }
        this.dependentfiles.push(file)
        this._generated = false
    }

    generateDependentFiles(existingfiles = []) {
        if (this._generated == true) {
            return
        }

        this.dependentfiles = []

        let regex = REQUIRE_REGEX()

        let matches
        while (matches = regex.exec(this.getContentWithIncludes(existingfiles))) {
            this.addDependentFile(this.getRelativeFile(matches[1], existingfiles))
        }
        this._generated = true
    }

    getRelativeFile(filepath, existingfiles = []) {
        let newfile = new File(filepath, this.dir())
        for (let existingfile of existingfiles) {
            if (newfile.absolutefilepath == existingfile.absolutefilepath) {
                return existingfile
            }
        }
        existingfiles.push(newfile)
        return newfile
    }

    dir() {
        return path.dirname(this.absolutefilepath)
    }

    static resolve(filepath, basedir = process.cwd()) {
        return path.normalize(
            path.resolve(
                resolve.sync(filepath, { basedir })
            )
        )
    }
}

function toposortDependencies(entryfilepath) {
    let existingfiles = []

    let sortedlist = []

    function DFSToposort(root) {
        if (root.permmark)
            return
        if (root.tempmark)
            throw new Error('Found a dependency cycle')

        root.tempmark = true

        // Generate dependencies on-the-fly while doing DFS
        root.generateDependentFiles(existingfiles)

        root.dependentfiles.forEach((vertex) => DFSToposort(vertex))

        root.permmark = true

        sortedlist.push(root)
    }

    let root = new File(entryfilepath)
    existingfiles.push(root)
    DFSToposort(root)

    return sortedlist
}


function bundle(entryfilepath, options = {}) {

    let order = toposortDependencies(entryfilepath)

    let bundled = concatFiles(order)

    if (!(options.disablebeautify == true)) {
        bundled = beautify(bundled, {
            indent_size: 4,
            end_with_newline: true,
            preserve_newlines: false
        })
    }

    return bundled
}

module.exports = { bundle: bundle }
