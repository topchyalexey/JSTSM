'use strict';

var dir = require('node-dir');
var mkdirp = require('mkdirp');

var _ = require('lodash');
var parsePath = require('parse-filepath');

var nunjucks = require('nunjucks');
nunjucks.configure({autoescape: false});

var fs = require('fs');

var dateformat = require('dateformat');

var argv = [];
var VERBOSE_LEVEL;
var namespace;

function WARN() {
    VERBOSE_LEVEL >= 0 && console.log.apply(console, arguments);
}

function INFO() {
    VERBOSE_LEVEL >= 1 && console.log.apply(console, arguments);
}

function DEBUG() {
    VERBOSE_LEVEL >= 2 && console.log.apply(console, arguments);
}

function withArgs(args) {
   argv = args;
   VERBOSE_LEVEL = argv.verbose;
   namespace = argv.namespace || "";
}

function parseFile(filePath, fileContent) {
    INFO("> Parsing", filePath);
    var fileName = parsePath(filePath).name;

    try {
        var json = JSON.parse(fileContent);
        return parseType(json, fileName);
    } catch (e) {
        return WARN("Parsing error:", e);
    }
}

function camelCase(string) {
    return string.replace(/-([a-z])/ig, function (all, letter) {
        return letter.toUpperCase();
    });
}

function generateTypeName(typeName) {
    return camelCase(_.upperFirst(typeName));
}

function generateTypesForDefinitions(json) {
    // generate defined types
    if (json.definitions) {

        Object.keys(json.definitions).map(key => {
            var p = json.definitions[key];
            parseType(p, key);
        })
    }
}

function collectTypesForProperties(json) {

    if (json.properties) {
        return Object.keys(json.properties).map(key => {
                var p = json.properties[key];

        var typeObject = typeObjectForProperty(p);
        if (typeObject == undefined) {
            throw "Can't find type mapping for property : " + JSON.stringify(p);
        }
        var o = {
            key: key,
            isArr: typeObject.isArr,
            isRef: typeObject.isRef,
            type: typeObject.isObj ? parseType(p, key).type : typeObject.typeStr,
            required: p.required && json.required.contains(key)
        };

        return o;
        });

    }
    return [];
}

function parseType(json, typeName) {

    INFO("Parsing type ", generateTypeName(typeName));
    // TODO: Validate

    generateTypesForDefinitions(json);

    var properties = collectTypesForProperties(json);
    if ( properties.length == 0 ) {
        var thisType = typeObjectForProperty(json);
        if ( thisType.isArr) {
            properties.push(  {
                key: "items",
                isArr: true,
                isRef: thisType.isRef,
                type: thisType.isObj ? parseType(p, key).type : thisType.typeStr,
                required: thisType.required && json.required.contains(key)
            })
        }
    }

    // Extends handling

    var handleExtends = argv['enable-extends'];

    if (handleExtends) {
        var superClass = json.extends && typeObjectForProperty(json.extends).typeStr;
    }

    var extendArray = prepareExtends(superClass);

    // Header

    if (argv['has-header']) {
        var now = new Date();
        var header = {
            projectName: argv.project || "<PROJECT_NAME>",
            author: argv.author || "<AUTHOR>",
            now: dateformat(now, "dd/mm/yy"),
            copyright: now.getFullYear() + " " + (argv.company || "<COMPANY>"), // eg. Copyright © 2016 OpenJet
        };
    }

    // Render
    var newTypeName = generateTypeName(typeName);
    var modelName = namespace + newTypeName;

    var templateFilePath = 'templates/template.nunjucks';
    var ctx = {
        modelName: modelName,
        header: header,
        isStruct: argv['use-struct'],
        extends: (extendArray && extendArray.length > 0) ? extendArray : false,
        hasSuperClass: !!superClass,
        properties: properties
    };
    var output = nunjucks.render(templateFilePath, ctx);

    // Write

    var outputDir = argv.o || './output';
    mkdirp(outputDir);

    var destFilePath = outputDir + "/" + modelName + ".swift";

    fs.writeFile(destFilePath, output, function (err) {
        if (err) {
            return WARN(err);
        }

        INFO("File saved to:", destFilePath);
    });

    return { type: newTypeName, description: ctx };
}

// HELPERS

var _basicTypes = {
    "string": "String",
    "integer": "Int",
    "number": "Double",
    "boolean": "Bool"
};

var anonymousTypeIndex = 0;

function typeObjectForProperty(p) {

    if (typeof p !== "object") {
        return;
    }

    if (p.hasOwnProperty("$ref")) {
        return {
            isArr: false,
            isRef: true,
            typeStr: namespace + _.upperFirst(parsePath(p.$ref).name)
        };
    }

    if (p.hasOwnProperty("type")) {
        switch (typeof p.type) {
            case "string":
                switch (p.type) {
                    case "array":
                        var itemsTypeObject = typeObjectForProperty(p.items);
                        if (!itemsTypeObject.typeStr) {
                            itemsTypeObject.typeStr = parseType(p.items, "items" + anonymousTypeIndex).type;
                        }
                        return {
                            isArr: true,
                            isRef: itemsTypeObject.isRef,
                            typeStr: p.items ? itemsTypeObject.typeStr : "AnyObject"
                        };
                        break;
                    case "object":
                        return {
                            isObj: true
                        };
                        break;
                    case "string":
                    case "integer":
                    case "number":
                    case "boolean":
                        return {
                            isArr: false,
                            isRef: false,
                            typeStr: _basicTypes[p.type]
                        };
                        break;
                    default:
                        DEBUG("type not handled:", p.type);
                        break;
                }
                break;
            default:
                DEBUG("typeof not handled:", typeof p.type);
                break;
        }
    }
}

function prepareExtends(superClass) {
    var extendArray = [];

    if (superClass) {
        extendArray.push(superClass);
    }

    var isStruct = argv['use-struct'];

    var inherits = argv.inherits;
    if (inherits && inherits.length) {
        if (isStruct) {
            return INFO("inheritance ignored with struct");
        }

        extendArray = inherits;
    }

    var protocols = argv.protocols;
    if (!superClass && protocols && protocols.length) {
        extendArray = extendArray.concat(protocols);
    }

    return extendArray;
}


module.exports.parseFile = parseFile;
module.exports.parseType = parseType;
module.exports.withArgs = withArgs;