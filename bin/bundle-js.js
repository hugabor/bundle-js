#!/usr/bin/env node

const optimist = require('optimist')

const globals = require('../globals.js')

let argv = optimist
    .demand(1)
    .options('o', { alias : ['out', 'dest'], default: globals.DEFAULT_OUTPUT_FILE, describe: 'Output file' })
    .options('p', { boolean: true, alias : ['print'], describe: 'Print the final bundled output to stdout' })
    .options('disable-beautify', { boolean: true, describe: 'Leave the concatenated files as-is (might be ugly!)' })
    .usage(
        '\n' +
        'Usage: bundle-js ./path/to/entryfile.js [-o ./path/to/outputfile] [-p]\n' +     // 80 character line width limit here
        '       [--disable-beautify]'
    )
    .argv

if (argv._[0] == 'help') {
    optimist.showHelp()
    process.exit()
}

let options = {}
options.entry = argv._[0]
options.dest = argv.o
options.print = argv.p
options.disablebeautify = argv['disable-beautify']

const bundle = require('../index.js')
bundle(options)
