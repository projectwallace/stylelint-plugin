import type stylelint from 'stylelint'
import { extract_line_heights } from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-line-heights',
	label: 'line heights',
	allow_zero: true,
	extract: extract_line_heights,
})

export default plugin
