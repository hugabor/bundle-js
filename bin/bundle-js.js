#!/usr/bin/env node

const bundle = require('../index.js')

let options = {}

options.dir = process.cwd()

for (let i = 2; i < process.argv.length; ++i) {
    if (process.argv[i].indexOf('o=') == 0 || process.argv[i].indexOf('out=') == 0 || process.argv[i].indexOf('dest=') == 0) {
        options.dest = process.argv[i].split('=')[1]
    } else if (process.argv[i].indexOf('entry=') == 0) {
        options.entry = process.argv[i].split('=')[1]
    } else if (process.argv[i].indexOf('dir=') == 0) {
        options.dir = process.argv[i].split('=')[1]
    } else if (process.argv[i].indexOf('target=') == 0) {
        options.target = process.argv[i].split('=')[1]
    } else if (process.argv[i].indexOf('exposed=') == 0) {
        options.exposed = [process.argv[i].split('=')[1]]
    } else if (process.argv[i].indexOf('export=') == 0) {
        options.export = process.argv[i].split('=')[1]
    } else if (process.argv[i].indexOf('--iife') == 0) {
        options.iife = true
    }
}

bundle(options)
