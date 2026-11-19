import type stylelint from 'stylelint'
import { extract_units } from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-units',
	label: 'units',
	extract: extract_units,
	count_by: (match) => match.unit,
	normalize: (unit) => unit.toLowerCase(),
})

export default plugin
