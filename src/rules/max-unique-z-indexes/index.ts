import type stylelint from 'stylelint'
import { extract_z_indexes } from '@projectwallace/css-analyzer/extract'
import { str_index_of } from '@projectwallace/css-parser/string-utils'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-z-indexes',
	label: 'z-indexes',
	allow_zero: true,
	// the analyzer also returns functions like `var(--z)`; only plain numbers count
	extract: (property, value) =>
		extract_z_indexes(property, value).filter((match) => str_index_of('(', match.value) === -1),
})

export default plugin
