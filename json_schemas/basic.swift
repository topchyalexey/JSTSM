// This file is generated

struct Test {

  // MARK: - Properties

  let id: String
  let name: String?
  let age: Int?
  let height: Double?
  let isRequired: Bool
  let notRequired: Bool?

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
