#!/usr/bin/env node

const bundle = require('../index.js')

let options = {}

options.dir = process.cwd()

for (let i = 2; i < process.argv.length; ++i) {
    if (process.argv[i].indexOf('--output ') == 0) {
        options.dest = process.argv[i].split('--output ')[1]
    } else if (process.argv[i].indexOf('--entry ') == 0) {
        options.entry = process.argv[i].split('--entry ')[1]
    } else if (process.argv[i].indexOf('--dir ') == 0) {
        options.dir = process.argv[i].split('--dir ')[1]
    } else if (process.argv[i].indexOf('--ignore-fileprefix ') == 0) {
        options.dir_ignore_prefix = process.argv[i].split('--ignore-fileprefix ')[1]
    } else if (process.argv[i].indexOf('--target ') == 0) {
        options.target = process.argv[i].split('--target ')[1]
    } else if (process.argv[i].indexOf('--exposed ') == 0) {
        options.exposed = [process.argv[i].split('--exposed ')[1]]
    } else if (process.argv[i].indexOf('--export ') == 0) {
        options.export = process.argv[i].split('--export ')[1]
    } else if (process.argv[i].indexOf('--ignore-sort') == 0) {
        options.ignore_sort = true
    } else if (process.argv[i].indexOf('--iife') == 0) {
        options.iife = true
    }
    
    // LEGACY PARAM
    else if (process.argv[i].indexOf('o=') == 0 || process.argv[i].indexOf('out=') == 0 || process.argv[i].indexOf('dest=') == 0) {
        options.dest = process.argv[i].split('=')[1]
    } else if (process.argv[i].indexOf('entry=') == 0) {
        options.entry = process.argv[i].split('=')[1]
    } else if (process.argv[i].indexOf('dir=') == 0) {
        options.dir = process.argv[i].split('=')[1]
    } else if (process.argv[i].indexOf('ignore-fileprefix=') == 0) {
        options.dir_ignore_prefix = process.argv[i].split('=')[1]
    } else if (process.argv[i].indexOf('target=') == 0) {
        options.target = process.argv[i].split('=')[1]
    } else if (process.argv[i].indexOf('exposed=') == 0) {
        options.exposed = [process.argv[i].split('=')[1]]
    } else if (process.argv[i].indexOf('export=') == 0) {
        options.export = process.argv[i].split('=')[1]
    }
}

bundle(options)
