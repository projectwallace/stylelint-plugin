import type stylelint from 'stylelint'
import {
	extract_border_radiuses,
	border_radius_properties,
} from '@projectwallace/css-analyzer/extract'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { define_unique_rule } from '../../utils/define-unique-rule.js'

/**
 * Values that are written differently but mean the same are counted once:
 * `2px  4px` becomes `2px 4px` and `4px/3px` becomes `4px / 3px`.
 */
function normalize(value: string): string {
	return [...parse_value(value).children].map((node) => node.text).join(' ')
}

const plugin: stylelint.Plugin = define_unique_rule({
	rule_name: 'projectwallace/max-unique-border-radiuses',
	label: 'border radiuses',
	properties: border_radius_properties,
	extract: extract_border_radiuses,
	normalize,
})

export default plugin
