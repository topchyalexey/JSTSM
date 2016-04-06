// This file is generated

{{ classOrStruct }} {{ name }} {

  // MARK: - Properties
{% for p in properties %}
  let {{ p.key }}: {{ p.type }}{% if !p.required %}?{% endif %}
{%- endfor %}

  // MARK: - Inits

  init?(json: [String: AnyObject]) {
  {% for p in properties %}
    self.{{ p.key }} = json["{{ p.key }}"] as{% if !p.required %}?{% else %}!{% endif %} {{ p.type }}
  {%- endfor %}
  }

}
