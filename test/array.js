
var expect    = require("chai").expect;
var app = require("../app/generator");
require("mocha");

describe("Array types generation", function() {

    it("Generated with items of type 'reference'", function() {
        var jsonShema = {
            "id": "#attrsType",
                "type": "array",
                "title": "Атрибуты документов или папки",
                "items": { "$ref": "#/definitions/attrType"  }
        };
        var t = app.parseType(jsonShema, "TypeName");
        expect( t.description ).to.deep.equal( {
                "extends": false,
                "hasSuperClass": false,
                "header": undefined,
                "isStruct": undefined,
                "modelName": "undefinedTypeName",
                "properties": [ {
                                "isArr": true,
                                "isRef": true,
                                "key": "items",
                                "required": undefined,
                                "type": "undefinedAttrType"
                }]
        });
    });

    it("Generated with items of type 'nested objects'", function() {
        var jsonShema = {
            "id": "#attrDatesType",
                "type": "object",
                "title": "Атрибут c датами",
                "properties": {
                    "value": {
                        "type": "array",
                        "items":{ "type": "string",  "format": "date-time" }
                    }
            },
            "required":["id", "value"]
        };
        var t = app.parseType(jsonShema, "TypeName");
        expect( t.description ).to.deep.equal( {
                modelName: "undefinedTypeName",
                header: undefined,
                extends: false,
                hasSuperClass: false,
                isStruct: undefined,
                properties: [{
                        isArr: true,
                        isRef: false,
                        key: "value",
                        required: undefined,
                        type: "String"   }]
        } );
    });
});