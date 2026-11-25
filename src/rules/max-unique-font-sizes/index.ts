import type stylelint from 'stylelint'
import { extract_font_sizes, font_size_properties } from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-font-sizes',
	label: 'font sizes',
	allow_zero: true,
	properties: font_size_properties,
	extract: extract_font_sizes,
	count_by: (match) => match.text,
})

export default plugin
