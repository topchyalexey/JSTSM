var nunjucks = require('nunjucks');
nunjucks.configure({ autoescape: false });

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
var destFilePath = argv.o || argv.s.replace(".json", ".swift");
console.log("src:", srcFilePath);
console.log("dest:", destFilePath);

// READ
var fs = require('fs');
var jsonFile = fs.readFileSync(srcFilePath, 'utf8');

console.log("jsonFile:", jsonFile);

// PARSE
var json = JSON.parse(jsonFile);

var types = {
    "string": "String",
    "integer": "Int",
    "number": "Double", // or "Float" ?
    "boolean": "Bool",
    // "array": "String",
    // "object": "String",
    // "null": "String",
}

var properties = [];
if (json.properties) {
    properties = Object.keys(json.properties).map(key => {
        return {
            key: key,
            type: types[json.properties[key].type],
            required: json.properties[key].required == true || json.required.includes(key)
        };
    });
}
console.log(properties);

var now = new Date();

// RENDER
var output = nunjucks.render('templates/template.swift', {
    modelName: 'Test',
    projectName: argv.project || "<PROJECT_NAME>",
    author: argv.author || "<AUTHOR>",
    now: dateformat(now, "dd/mm/yy"),
    copyright: now.getFullYear() + (argv.company ? " "+argv.company : ""), // eg. Copyright © 2016 OpenJet
    classOrStruct: argv['use-struct'] ? "struct" : "class",
    properties: properties
});

console.log(output);

// WRITE
fs.writeFile(destFilePath, output, function (err) {
    if (err) { return console.log(err); }

    console.log("File saved to:", destFilePath);
});
