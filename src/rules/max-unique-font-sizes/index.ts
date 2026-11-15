import type stylelint from 'stylelint'
import { extract_font_sizes } from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-font-sizes',
	label: 'font sizes',
	allow_zero: true,
	extract: extract_font_sizes,
})

export default plugin
