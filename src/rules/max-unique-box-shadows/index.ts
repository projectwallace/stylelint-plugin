import type stylelint from 'stylelint'
import { extract_box_shadows, box_shadow_properties } from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-box-shadows',
	label: 'box shadows',
	properties: box_shadow_properties,
	extract: (_property, value) => extract_box_shadows(value),
	count_by: (match) => match.text,
})

export default plugin
