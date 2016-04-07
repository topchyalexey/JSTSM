# JSTSM

JSON Schema To Swift Model

### Handled
- [x] basic types
    - `string` -> String
    - `integer` -> Int
    - `number` -> Double
    - `boolean` -> Bool
- [x] `required` -> Optional
- [x] header
    - author
    - project
    - copyright
    - date
- [x] class Or struct (with --use-struct parameter)

### TODO
- [x] `array` type
- [ ] `object` type
- [ ] `null` type
- [x] `$ref`
- [ ] `format`

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
