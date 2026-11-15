import type stylelint from 'stylelint'
import { extract_text_shadows } from '@projectwallace/css-analyzer/extract'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-text-shadows',
	label: 'text shadows',
	extract: extract_text_shadows,
})

export default plugin
