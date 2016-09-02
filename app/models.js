'use strict';


class Model {
    constructor() {
        this.name = null;
        this.props = [];
    }
}


class Property {
    constructor() {
        this.typeName = null;
        this.desc = null;
        this.name = null;
        this.key = null;
        this.isArr = false;
        this.isEnum = false;
        this.isRef = false;
        this.isRequired = false;
        this.enumValues = [];
    }
}


class HeaderInfo {
    constructor() {

    }
}


module.exports.Model = Model;
module.exports.Property = Property;
module.exports.HeaderInfo = HeaderInfo;
