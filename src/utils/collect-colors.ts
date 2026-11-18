import { extract_colors } from '@projectwallace/css-analyzer/extract'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk_values } from '@projectwallace/css-parser/walker'
import { is_function, is_identifier } from '@projectwallace/css-parser/node-types'
import { is_custom, str_equals } from '@projectwallace/css-parser/string-utils'
import type { Root } from 'postcss'
import { unquote } from './unquote.js'

export type ColorCallback = (color: string, format: string) => void

/**
 * Invoke `callback` for each color in a declaration value, passing the color text and its
 * format ('hex', 'named', 'system', or a function name like 'rgb'/'hsl'/'oklch'/'color').
 *
 * Composing functions such as color-mix() and light-dark() are transparent:
 * the colors inside their arguments are reported.
 *
 * When `resolve_var` is true, var() references to known @property <color>
 * custom properties are also reported as format 'var'. CSS does not allow
 * var() in @property initial-value, so pass false when scanning initial-value.
 */
export function collect_colors(
	property: string,
	value: string,
	resolve_var: boolean,
	color_custom_properties: Set<string>,
	callback: ColorCallback,
): void {
	const found = extract_colors(property, value).map((match) => ({
		offset: match.offset,
		color: match.value,
		format: match.format,
	}))

	if (resolve_var && color_custom_properties.size > 0) {
		walk_values(parse_value(value), (node) => {
			if (is_function(node) && str_equals('var', node.name ?? '')) {
				const first = node.first_child
				if (first !== null && is_identifier(first) && color_custom_properties.has(first.text)) {
					found.push({ offset: node.start, color: node.text, format: 'var' })
				}
			}
		})
		found.sort((a, b) => a.offset - b.offset)
	}

	for (const { color, format } of found) {
		callback(color, format)
	}
}

/**
 * Custom properties registered with `@property { syntax: '<color>' }`: `var()` references to
 * these are colors.
 */
export function collect_registered_colors(root: Root): Set<string> {
	const names = new Set<string>()
	root.walkAtRules(/^property$/i, (at_rule) => {
		const name = at_rule.params.trim()
		if (!is_custom(name)) {
			return
		}
		at_rule.walkDecls(/^syntax$/i, (decl) => {
			// syntax values may be quoted: '"<color>"' or "'<color>'"
			if (unquote(decl.value.trim()) === '<color>') {
				names.add(name)
			}
		})
	})
	return names
}
