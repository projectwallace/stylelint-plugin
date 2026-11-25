import type stylelint from 'stylelint'
import { extract_text_shadows, text_shadow_properties } from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-text-shadows',
	label: 'text shadows',
	properties: text_shadow_properties,
	extract: (_property, value) => extract_text_shadows(value),
	count_by: (match) => match.text,
})

export default plugin
