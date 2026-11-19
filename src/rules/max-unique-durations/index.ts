import type stylelint from 'stylelint'
import { extract_durations, duration_properties } from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-durations',
	label: 'durations',
	properties: duration_properties,
	extract: extract_durations,
})

export default plugin
