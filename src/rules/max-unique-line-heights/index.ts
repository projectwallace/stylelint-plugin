import type stylelint from 'stylelint'
import { extract_line_heights, line_height_properties } from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-line-heights',
	label: 'line heights',
	allow_zero: true,
	properties: line_height_properties,
	extract: extract_line_heights,
	count_by: (match) => match.text,
})

export default plugin
