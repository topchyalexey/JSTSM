
'use strict';

var argv = require('yargs')
    .usage('Usage: $0 -s [source]')
    .example('$0 -s model.json')
    .example('$0 -s model.json -a Me -p MyProject -c MyCompany')
    .example('$0 -s model.json --use-struct --namespace My')
    .demand('s')
    .alias('s', 'source')
    .describe('s', 'Source file or dir')
    .alias('o', 'output-dir')
    .describe('o', 'Output dir')
    .alias('t', 'template')
    .describe('t', 'Specify template file')
    .boolean('use-struct')
    .describe('use-struct', 'Use `struct` (default is `class`)')
    .boolean('enable-extends')
    .describe('enable-extends', 'Enable parsing of `extends` key in json schema')
    .array('inherits')
    .describe('inherits', 'Specify inheritances')
    .array('protocols')
    .describe('protocols', 'Specify protocols')
    .boolean('has-header')
    .describe('has-header', 'Add header')
    .alias('p', 'project')
    .describe('p', 'Specify project name for header')
    .alias('a', 'author')
    .describe('a', 'Specify author name for header')
    .alias('c', 'company')
    .describe('c', 'Specify company name for header')
    .alias('n', 'namespace')
    .describe('n', 'Specify a namespace prefix')
    .count('verbose')
    .alias('v', 'verbose')
    .describe('v', 'Specify verbosity level (eg. -vv = Level 2)')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright - akabab 2016')
    .argv;
var Application = require('./app/application');


try {
    Application.run(argv);
} catch (e) {
    return console.error(e.message);
}

