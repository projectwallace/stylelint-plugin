import type stylelint from 'stylelint'
import { extract_font_families } from '@projectwallace/css-analyzer/extract'
import { is_in_font_face } from '../../utils/font-face.js'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-font-families',
	label: 'font families',
	allow_zero: true,
	extract: (property, value, declaration) =>
		is_in_font_face(declaration) ? [] : extract_font_families(property, value),
})

export default plugin
