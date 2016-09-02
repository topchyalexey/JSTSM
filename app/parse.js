'use strict';


var fs = require('fs');
var parsePath = require('parse-filepath');
var ModelsModule = require('./models');
var utils = require('./utils');



var BASIC_TYPES = {
    'string': 'String',
    'integer': 'Int',
    'long': 'Int',
    'number': 'Double',
    'boolean': 'Bool'
};


var models = [];


/**
 * @param filePath string
 * @returns [Model]
 */
function parse(filePath) {
    var fileName = parsePath(filePath).name;

    console.log('> Parsing', fileName);

    try {
        models = [];
        var content = fs.readFileSync(filePath, 'utf8');
        var json = JSON.parse(content);
        parseModel(json, fileName);
        return models;
    } catch (e) {
        console.log('Parsing error: ', e);
    }
}


/**
 * @param json Object
 * @param typeName String
 * @returns Model
 */
function parseModel(json, typeName) {
    if (json['definitions']) {
        parseDefinitions(json);
    }

    var model = new ModelsModule.Model();
    model.name = utils.generateTypeName(typeName);

    if (json['type'] == 'object') {
        model.props = parseProperties(json);
    } else if (json['type'] == 'array') {
        model.props = [parseProperty(json, typeName)];
    }

    models.push(model);

    return model;
}


/**
 * @param json Object
 */
function parseDefinitions(json) {
    Object.keys(json['definitions']).forEach(key => {
        parseModel(json['definitions'][key], key);
    });
}


/**
 * @param propertyValue Object
 * @param key String
 * @returns Property
 */
function parseProperty(propertyValue, key) {
    if (typeof propertyValue !== 'object') {
        return null;
    }

    var property = new ModelsModule.Property();
    property.key = key;
    property.name = utils.generateKeyName(key);

    if (propertyValue.hasOwnProperty('$ref')) {
        property.isRef = true;
        property.typeName = utils.generateTypeName(parsePath(propertyValue['$ref']).name);
        return property;
    }

    if (propertyValue.hasOwnProperty('enum')) {
        property.isEnum = true;
        property.enumValues = propertyValue['enum'].map(item => {
            return {
                'name': 'Value' + utils.camelCase(item),
                'value': item
            }
        });
        property.typeName = utils.generateTypeName(key + 'Enum');
        return property;
    }

    if (propertyValue.hasOwnProperty('type')) {
        switch (propertyValue['type']) {
            case 'array':
                var itemsProperty = parseProperty(propertyValue['items'], key + 'Item');
                property.name = utils.generateKeyName(key + 'Items');
                property.isArr = true;
                property.isRef = itemsProperty.isRef;
                property.typeName = itemsProperty.typeName;
                return property;

            case 'object':
                var objectModel = parseModel(propertyValue, key);
                property.isRef = true;
                property.typeName = objectModel.name;
                return property;

            case 'string':
            case 'integer':
            case 'number':
            case 'long':
            case 'boolean':
                property.typeName = BASIC_TYPES[propertyValue['type']];
                return property;

            default:
                throw 'type not handled: ' + propertyValue['type'];
        }
    }
}


/**
 * @param json Object
 * @returns [Property]
 */
function parseProperties(json) {
    if (json['properties'] == undefined) {
        return [];
    }

    return Object.keys(json['properties']).map(key => {
        var p = json['properties'][key];
        var propertyInfo = parseProperty(p, key);

        if (propertyInfo == null) {
            throw 'Can\'t find type mapping for property : ' + JSON.stringify(p);
        }

        propertyInfo.desc = p['title'];
        propertyInfo.isRequired = p['required'] && json['required'].contains(key);

        return propertyInfo;
    });
}


module.exports = parse;