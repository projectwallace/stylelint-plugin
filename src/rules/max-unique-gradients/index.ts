import type stylelint from 'stylelint'
import { extract_gradients } from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-gradients',
	label: 'gradients',
	extract: extract_gradients,
})

export default plugin
