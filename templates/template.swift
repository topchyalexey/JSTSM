//
//  {{ modelName|capitalize }}.swift
//  {{ projectName }}
//
//  Created by {{ author }} on {{ now }}.
//  Copyright © {{ copyright }}. All rights reserved.
//
//  This file has been generated, modify it at your own risks!
//

{{ classOrStruct }} {{ modelName|capitalize }} {

  // MARK: - Properties
{% for p in properties %}
  let {{ p.key }}: {{ p.type }}{{ "!" if p.required else "?" }}
{%- endfor %}

  // MARK: - Inits

  init?(json: [String: AnyObject]) {
  {% for p in properties %}
    self.{{ p.key }} = json["{{ p.key }}"] as{{ "!" if p.required else "?" }} {{ p.type }}
  {%- endfor %}
  }

}
