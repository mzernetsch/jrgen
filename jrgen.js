#!/usr/bin/env node

var program = require('commander');
program
    .version('1.0.0')
    .command('docs', 'Generate docs').alias('d')
    .command('test', 'Generate tests').alias('t')
    .command('client', 'Generate client').alias('c')
    .command('server', 'Generate server').alias('s')
    .parse(process.argv);
