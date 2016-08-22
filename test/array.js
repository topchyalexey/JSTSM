

var expect    = require("chai").expect;
var app = require("../app/generator");
var m = require("mocha");

m.describe("Array types generation", function() {

    it("Generated with items of type 'reference'", function() {
        var jsonShema = {
            "id": "#attrsType",
                "type": "array",
                "title": "Атрибуты документов или папки",
                "items": {
                "$ref": "#/definitions/attrType"
            }
        }
        var t = app.parseType(jsonShema, "TypeName");
        expect( t.description ).to.equal( { } );
    });

    it("Generated with items of type 'nested objects'", function() {

    });
});