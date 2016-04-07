require('./utils.js');

var dir = require('node-dir');
var mkdirp = require('mkdirp');

var _ = require('lodash');
var parsePath = require('parse-filepath');

var nunjucks = require('nunjucks');
nunjucks.configure({ autoescape: false });

// var jsonschema = require('jsonschema');

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
    .alias('u', 'use-struct') // default is class
    .argv;

var srcFilePath = argv.s;
// console.log("src:", srcFilePath);

// dir.readFiles(__dirname, {
//     match: /.txt$/,
//     exclude: /^\./
//     }, function(err, content, next) {
//         if (err) throw err;
//         console.log('content:', content);
//         next();
//     },
//     function(err, files){
//         if (err) throw err;
//         console.log('finished reading files:',files);
//     });


// READ
var fs = require('fs');
var jsonFile = fs.readFileSync(srcFilePath, 'utf8');

var srcFileName = parsePath(srcFilePath).name;
// console.log("srcFileName:", srcFileName);

// PARSE & VALIDATE
var json = JSON.parse(jsonFile);
// console.log("json:", json);

// var draft4schema = JSON.parse(fs.readFileSync("./draft_schemas/draft-04/schema.json", 'utf8'));
// console.log("draft4schema:", draft4schema);

// var v = jsonschema.validate(json, draft4schema);
// var v = jsonschema.validate({"one": 1}, draft4schema);
// console.log("v:", v);

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

function typeForProperty(p) {
    var _basicTypes = {
        "string": "String",
        "integer": "Int",
        "number": "Double", // or "Float" ?
        "boolean": "Bool",
        // "array": "",
        // "object": "",
        // "null": "",
        // any ?
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
                    default: console.warn("type not handled:", p.type); break;
                }
                break;
            default: console.warn("typeof not handled:", typeof p.type); break;
        }
    }

}

// RENDER
var now = new Date();
var modelName = _.upperFirst(srcFileName);

var output = nunjucks.render('templates/template.swift', {
    modelName: modelName,
    projectName: argv.project || "<PROJECT_NAME>",
    author: argv.author || "<AUTHOR>",
    now: dateformat(now, "dd/mm/yy"),
    copyright: now.getFullYear() + " " + (argv.company || "<COMPANY>"), // eg. Copyright © 2016 OpenJet
    classOrStruct: argv['use-struct'] ? "struct" : "class",
    properties: properties
});

console.log(output);

// WRITE
mkdirp('output');

var destFilePath = "./output/" + (argv.o || modelName + ".swift");

fs.writeFile(destFilePath, output, function (err) {
    if (err) { return console.log(err); }

    console.log("File saved to:", destFilePath);
});
