require('./utils.js');

var dir = require('node-dir');
var mkdirp = require('mkdirp');

var _ = require('lodash');
var parsePath = require('parse-filepath');

var nunjucks = require('nunjucks');
nunjucks.configure({ autoescape: false });

var fs = require('fs');

// var jsonschema = require('jsonschema');
// var draft4schema = JSON.parse(fs.readFileSync("./draft_schemas/draft-04/schema.json", 'utf8'));
// console.log("draft4schema:", draft4schema);
// var v = jsonschema.validate(json, draft4schema);
// var v = jsonschema.validate({"one": 1}, draft4schema);
// console.log("v:", v);

var dateformat = require('dateformat');

var argv = require('yargs')
    .usage('Usage: $0 -s [src] -o [dest]')
    .demand('s')
    .alias('s', 'src')
    // .demand('o')
    .alias('o', 'dest')
    .alias('p', 'project')
    .alias('a', 'author')
    .alias('c', 'company')
    .boolean('u')
    .alias('u', 'use-struct') // default is class
    .count('verbose')
    .alias('v', 'verbose')
    .argv;

VERBOSE_LEVEL = argv.verbose;

function WARN()  { VERBOSE_LEVEL >= 0 && console.log.apply(console, arguments); }
function INFO()  { VERBOSE_LEVEL >= 1 && console.log.apply(console, arguments); }
function DEBUG() { VERBOSE_LEVEL >= 2 && console.log.apply(console, arguments); }


// START

var srcPath = argv.s;
try {
    fs.accessSync(srcPath);
    var stat = fs.lstatSync(srcPath);

    if (stat.isDirectory()) {
        dir.readFiles(srcPath, {
                match: /.json$/,
            }, function (err, fileContent, filePath, next) {
                if (err) throw err;

                parseFile(filePath, fileContent);
                next();
            },
            function (err, files){
                if (err) throw err;
            });

    }
    else if (stat.isFile()) {
        var fileContent = fs.readFileSync(srcPath, 'utf8');

        parseFile(srcPath, fileContent);
    }

} catch (e) {
    return WARN(e.message);
}

// METHODS

function parseFile(filePath, fileContent) {
    INFO("> Parsing", filePath);
    var fileName = parsePath(filePath).name;

    try {
        var json = JSON.parse(fileContent);
    } catch (e) {
        return WARN("Parsing error:", e);
    }

    // TODO: Validate

    // Prepare

    var properties = [];
    if (json.properties) {
        properties = Object.keys(json.properties).map(key => {
            var p = json.properties[key];

            return {
                key: key,
                isRef: p.hasOwnProperty("$ref"),
                type: typeForProperty(p),
                required: p.required == true || json.required.contains(key)
            };
        });
    }

    // Render

    var now = new Date();
    var modelName = _.upperFirst(fileName);

    var output = nunjucks.render('templates/template.swift', {
        modelName: modelName,
        projectName: argv.project || "<PROJECT_NAME>",
        author: argv.author || "<AUTHOR>",
        now: dateformat(now, "dd/mm/yy"),
        copyright: now.getFullYear() + " " + (argv.company || "<COMPANY>"), // eg. Copyright © 2016 OpenJet
        classOrStruct: argv['use-struct'] ? "struct" : "class",
        properties: properties
    });

    // Write

    mkdirp('output');

    var destFilePath = "./output/" + (argv.o || modelName + ".swift");

    fs.writeFile(destFilePath, output, function (err) {
        if (err) { return WARN(err); }

        INFO("File saved to:", destFilePath);
    });

}

// HELPERS

function typeForProperty(p) {
    var _basicTypes = {
        "string": "String",
        "integer": "Int",
        "number": "Double",
        "boolean": "Bool",
    }

    if (p.hasOwnProperty("$ref")) {
        return _.upperFirst(parsePath(p.$ref).name);
    }

    if (p.hasOwnProperty("type")) {
        switch (typeof p.type) {
            case "string":
                switch (p.type) {
                    case "array":
                        return "[" + (p.items ? typeForProperty(p.items) : "AnyObject") + "]";
                        break;
                    case "string":
                    case "integer":
                    case "number":
                    case "boolean":
                        return _basicTypes[p.type];
                        break;
                    default: DEBUG("type not handled:", p.type); break;
                }
                break;
            default: DEBUG("typeof not handled:", typeof p.type); break;
        }
    }
}
