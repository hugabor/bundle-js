const fs = require('fs')
const path = require('path')

const globals = require('./globals.js')
const bundler = require('./bundler.js')

function bundle(options = {}) {

    if (!options.entryfilepath) {
        throw new Error('options.entryfilepath was not defined')
    }

    let entryfilepath = path.normalize(path.resolve(process.cwd(), options.entryfilepath))
    let bundled = bundler.bundle(entryfilepath, options)

    if (options.destfilepath) {
        let dest = path.normalize(path.resolve(process.cwd(), options.destfilepath || globals.DEFAULT_OUTPUT_FILE))
        if (!fs.existsSync(path.dirname(dest))) {
            fs.mkdirSync(path.dirname(dest))
        }
        fs.writeFileSync(dest, bundled, { encoding: options.encoding || 'utf-8' })
    }
    if (options.print) {
        process.stdout.write(bundled)
    } else {
        console.log('Bundled:', bundled.split('\n'), 'lines')
        if (options.destfilepath) {
            console.log('Wrote to file:', options.destfilepath)
        }
        console.log('Done.')
    }

    return bundled
}

module.exports = bundle
