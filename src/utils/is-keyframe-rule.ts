import { str_equals, strip_vendor_prefix } from '@projectwallace/css-parser/string-utils'
import type { Rule, AtRule } from 'postcss'

export function is_keyframe_rule(rule: Rule): boolean {
	return (
		rule.parent?.type === 'atrule' &&
		str_equals('keyframes', strip_vendor_prefix((rule.parent as AtRule).name))
	)
}
