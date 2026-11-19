import type stylelint from 'stylelint'
import {
	extract_timing_functions,
	timing_function_properties,
} from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-animation-functions',
	label: 'animation-functions',
	properties: timing_function_properties,
	extract: extract_timing_functions,
})

export default plugin
