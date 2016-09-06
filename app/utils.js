'use strict';


var _ = require('lodash');


Array.prototype.contains = function (item) {
    return this.indexOf(item) != -1
};

function camelCase(string) {
    return string.replace(/^([-_]*)/, '').replace(/[-_]([a-zа-я])/ig, function (all, letter) {
        return letter.toUpperCase();
    });
}

module.exports.camelCase = camelCase;

module.exports.generateKeyName = function (keyName) {
    var name = _.lowerFirst(camelCase(keyName));

    if (['class', 'enum', 'struct', 'for'].contains(name)) {
        name += 'Type';
    }

    return name;
};

module.exports.generateTypeName = function (typeName) {
    var name = _.upperFirst(camelCase(typeName));

    if (name.endsWith('Type')) {
        name = name.replace('Type', '');
    }

    return name + 'JsonModel';
};
