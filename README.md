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

### TODO
- [ ] `array` type
- [ ] `object` type
- [ ] `null` type
- [ ] `$ref`
- [ ] `format`

## Exemple

`Basic.json` file
```json
{
    "$schema": "http://json-schema.org/draft-04/schema#",
    "id": "",
    "type": "object",
    "title": "",
    "description": "",
    "properties": {
        "id": { "type": "string" },
        "name": { "type": "string" },
        "age": { "type": "integer" },
        "height": { "type": "number" },
        "isRequired": { "type": "boolean", "required": true },
        "notRequired": { "type": "boolean", "required": false }
    },
    "required": ["id"]
}
```

> `node --harmony index.js -s json_schemas/basic.json -a Me -p MyProject -c MyCompany --use-struct`

`Basic.swift` output file
```swift
//
//  Basic.swift
//  MyProject
//
//  Created by Me on 06/04/16.
//  Copyright © 2016 MyCompany. All rights reserved.
//
//  This file has been generated, modify it at your own risks!
//

struct Basic {

  // MARK: - Properties

  let id: String?
  let name: String
  let age: Int
  let height: Double
  let isRequired: Bool?
  let notRequired: Bool

  // MARK: - Inits

  init?(json: [String: AnyObject]) {
  
    self.id = json["id"] as! String
    self.name = json["name"] as? String
    self.age = json["age"] as? Int
    self.height = json["height"] as? Double
    self.isRequired = json["isRequired"] as! Bool
    self.notRequired = json["notRequired"] as? Bool
  }

}
```
