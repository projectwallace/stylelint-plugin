import type { Rule, AtRule } from 'postcss'

export function is_keyframe_rule(rule: Rule): boolean {
	return rule.parent?.type === 'atrule' && /keyframes/i.test((rule.parent as AtRule).name)
}
