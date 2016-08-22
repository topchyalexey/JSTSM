# JSTSM

JSON Schema To Swift Model

`./jstsm -s model.json` -> `Model.swift`

### Handled
- [x] basic types
    - `string` -> String
    - `integer` -> Int
    - `number` -> Double
    - `boolean` -> Bool
- [x] `array` type
- [x] `object` type
- [x] `$ref`
- [x] `required` -> Optional
- [x] header (with --has-header)
    - project (with -p | --project <project>)
    - author (with -a | --author <author>)
    - company (with -c | --company <company>)
- [x] class Or struct (with --use-struct)
- [x] `extends` custom schema key (with `$ref`) for inheritance (with --enable-extends)

### TODO
- [ ] `allOf`, `anyOf`, `oneOf` ..
- [x] pass dir as source and transform recursively *.json files

## Help
`./jstsm -h`

## Test 
    
   `./node_modules/mocha/bin/mocha ./test/array.js`
    
## Exemple

`Basic.json` file
```json
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "type": "object",
    "title": "",
    "description": "",
    "properties": {
        "string": { "type": "string" },
        "optString": { "type": "string" },
        "optInteger": { "type": "integer" },
        "optNumber": { "type": "number" },
        "boolean": { "type": "boolean" },
        "optBoolean": { "type": "boolean" }
    },
    "required": ["string", "boolean"]
}
```

> `node index.js -s json_schemas/basic.json -a Me -p MyProject -c MyCompany --use-struct`

`Basic.swift` output file
```swift
//
//  Basic.swift
//  MyProject
//
//  Created by Me on 07/04/16.
//  Copyright © 2016 MyCompany. All rights reserved.
//
//  This file has been generated, modify it at your own risks!
//

struct Basic {

  // MARK: - Properties

  let string: String
  let optString: String?
  let optInteger: Int?
  let optNumber: Double?
  let boolean: Bool
  let optBoolean: Bool?

  // MARK: - Inits

  init?(json: [String: AnyObject]) {
  
    self.string = json["string"] as! String
    self.optString = json["optString"] as? String
    self.optInteger = json["optInteger"] as? Int
    self.optNumber = json["optNumber"] as? Double
    self.boolean = json["boolean"] as! Bool
    self.optBoolean = json["optBoolean"] as? Bool
  }

}
```
