//
//  {{ modelName }}.swift
//  {{ projectName }}
//
//  Created by {{ author }} on {{ now }}.
//  Copyright © {{ copyright }}. All rights reserved.
//
//  This file has been generated, modify it at your own risks!
//

{{ classOrStruct }} {{ modelName }} {

  // MARK: - Properties
{% for p in properties %}
  let {{ p.key }}: {{ p.type }}{{ "?" if not p.required }}
{% endfor %}

  // MARK: - Inits

  init?(json: [String: AnyObject]) {
  {% for p in properties %}
    {%- if p.isRef %}
      {%- if p.required %}
    self.{{ p.key }} = {{ p.type }}(json: json["{{ p.key }}"] as! [String: AnyObject])!
      {%- else %}
    if let {{ p.key }} = json["{{ p.key }}"] as? [String: AnyObject] {
      self.{{ p.key }} = {{ p.type }}(json: {{ p.key }})!
    }
      {%- endif %}
    {%- else %}
    self.{{ p.key }} = json["{{ p.key }}"] as{{ "!" if p.required else "?" }} {{ p.type }}
    {%- endif %}
  {% endfor %}
  }

}
