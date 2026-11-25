import type { AtRule, Declaration } from 'postcss'
import type { AtrulePrelude, Value } from '@projectwallace/css-parser'
import { is_atrule, is_atrule_prelude } from '@projectwallace/css-parser/node-types'
import { parse } from '@projectwallace/css-parser/parse'
import { parse_value } from '@projectwallace/css-parser/parse-value'

const values = new WeakMap<Declaration, Value>()

/**
 * The parsed value of a declaration. Parsed once per declaration, because several rules read it.
 * Offsets are relative to the value: add `get_value_offset(declaration)` to point into the declaration.
 */
export function parse_value_of(declaration: Declaration): Value {
	let value = values.get(declaration)
	if (!value) {
		// postcss can keep a trailing space (`red\\9 }`), which hides what the value ends with
		value = parse_value(declaration.value.trimEnd())
		values.set(declaration, value)
	}
	return value
}

const preludes = new WeakMap<AtRule, AtrulePrelude | null>()

/**
 * The parsed prelude of an at-rule, or `undefined` when it has none or the parser left it unparsed (a quoted `@keyframes` name). The at-rule is parsed from its
 * own name and params, so offsets are relative to the start of the at-rule (`@media (...)`): they
 * can go straight into `index` and `endIndex` of a report.
 */
export function parse_prelude_of(at_rule: AtRule): AtrulePrelude | undefined {
	let prelude = preludes.get(at_rule)
	if (prelude === undefined) {
		const css = `@${at_rule.name}${at_rule.raws.afterName ?? ' '}${at_rule.params} {}`
		const node = parse(css).first_child
		prelude =
			node && is_atrule(node) && node.has_prelude && is_atrule_prelude(node.prelude)
				? node.prelude
				: null
		preludes.set(at_rule, prelude)
	}
	return prelude ?? undefined
}
