import { extract_colors } from '@projectwallace/css-analyzer/extract'
import { get_property_name } from '@projectwallace/css-analyzer/atrules'
import { get_var_references } from '@projectwallace/css-analyzer/values'
import { is_custom } from '@projectwallace/css-parser/string-utils'
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
		for (const { value: name, offset } of get_var_references(value)) {
			if (color_custom_properties.has(name)) {
				found.push({ offset, color: `var(${name})`, format: 'var' })
			}
		}
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
		const name = get_property_name(at_rule.params)?.value
		if (!name || !is_custom(name)) {
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
