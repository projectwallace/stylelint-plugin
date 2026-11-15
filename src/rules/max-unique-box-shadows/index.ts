import type stylelint from 'stylelint'
import { extract_box_shadows } from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-box-shadows',
	label: 'box shadows',
	extract: extract_box_shadows,
})

export default plugin
