
var chai    = require("chai");
var assert = chai.assert,
    expect = chai.expect;

var app = require("../app/generator");
//var m = require("mocha");

describe("Object types generation", function() {

    it("Generated with properties of primitive types, such as 'string', 'number', and so on", function() {

        var jsonShema = { "id":   "#someType", "type": "object", "description": "Desc",
            "properties": {
            "num":       { "type": "number", "title": "Number" },
            "bool":       { "type": "boolean", "title": "Bool" },
            "date":   	{ "type": "string",  "format": "date-time", "title": "Date" },
            "place":       { "type": "string", "title": "Str" }
        }};
        var t = app.parseType(jsonShema, "TypeName");
        expect( t.description ).to.deep.equal( {
            "extends": false,
            "hasSuperClass": false,
            "header": undefined,
            "isStruct": undefined,
            "modelName": "undefinedTypeName",
            "properties": [
                {  description: "Number", "isArr": false, "isRef": false,  "key": "num", "required": undefined, "type": "Double"  },
                {  description: "Bool", "isArr": false, "isRef": false,  "key": "bool", "required": undefined, "type": "Bool"  },
                {  description: "Date", "isArr": false, "isRef": false,  "key": "date", "required": undefined, "type": "String"  },
                {  description: "Str", "isArr": false, "isRef": false,  "key": "place", "required": undefined, "type": "String"  }
            ]
        });
    });

    it("Throws error on non standard types such as 'date'", function() {
        var jsonShema = { "id":   "#someType", "type": "object",
            "properties": {
                "date":   	{ "type": "date",  "title": "Date" }
            }}

        assert.throws(function() {
            app.parseType(jsonShema, "TypeName");
        });

    });

});