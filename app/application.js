'use strict';


var fs = require('fs'),
    dir = require('node-dir'),
    parse = require('./parse');

var utils = require('./utils');
var dateformat = require('dateformat');
var mkdirp = require('mkdirp');

var nunjucks = require('nunjucks');
nunjucks.configure({autoescape: false});




function prepareExtends(superClass) {
    var extendArray = [];

    if (superClass) {
        extendArray.push(superClass);
    }

    var isStruct = args['use-struct'];

    var inherits = args['inherits'];
    if (inherits && inherits.length) {
        if (isStruct) {
            return INFO("inheritance ignored with struct");
        }

        extendArray = inherits;
    }

    var protocols = args['protocols'];
    if (!superClass && protocols && protocols.length) {
        extendArray = extendArray.concat(protocols);
    }

    return extendArray;
}


var args;

class Application {

    static run(scriptArgs) {
        args = scriptArgs;
        Application._parseFiles(args.s);
    }

    static _parseFiles(path) {
        fs.accessSync(path);
        var stat = fs.lstatSync(path);

        if (stat.isDirectory()) {
            dir.files(path, (err, files) => {
                if (err) throw err;

                files
                    .filter((file) => {
                        return file.endsWith('.json')
                    })
                    .forEach((file) => {
                        Application._saveModelsInFile(file);
                    });
            });
        } else if (stat.isFile() && path.endsWith('.json')) {
            Application._saveModelsInFile(path);
        }
    }

    static _saveModelsInFile(filePath) {
        let models = parse(filePath);

        if (models != null) {
            var items = {};

            models.forEach(model => {
                if (!items[model.name]) {
                    items[model.name] = model;
                } else {
                    items[model.name] = model.props.length > items[model.name].props.length ? model : items[model.name];
                }
            });

            Object.keys(items).forEach(key => {
                Application._generateFileForModel(items[key]);
            });
        }
    }

    static _generateFileForModel(model) {
        // Extends handling
        var handleExtends = args['enable-extends'];

        if (handleExtends) {
            var superClass = json.extends && parseProperty(json.extends).typeStr;
        }

        var extendArray = prepareExtends(superClass);

        // Header
        if (args['has-header']) {
            var now = new Date();
            var header = {
                projectName: args['project'] || "<PROJECT_NAME>",
                author: args['author'] || "<AUTHOR>",
                now: dateformat(now, "dd/mm/yy"),
                copyright: now.getFullYear() + " " + (args['company'] || "<COMPANY>"), // eg. Copyright © 2016 OpenJet
            };
        }

        // Render
        var templateFilePath = 'templates/template.nunjucks';
        var ctx = {
            modelName: model.name,
            header: header,
            isStruct: args['use-struct'],
            extends: (extendArray && extendArray.length > 0) ? extendArray : false,
            hasSuperClass: !!superClass,
            properties: model.props
        };
        var output = nunjucks.render(templateFilePath, ctx);

        // Write
        var outputDir = args['o'] || './output';
        mkdirp(outputDir);

        var destFilePath = outputDir + "/" + ctx.modelName + ".swift";

        fs.writeFile(destFilePath, output, function (err) {
            if (err) {
                console.error(err);
            }
        });
    }

}

module.exports = Application;