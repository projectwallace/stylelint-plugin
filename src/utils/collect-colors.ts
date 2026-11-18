import { extract_colors } from '@projectwallace/css-analyzer/extract'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk_values } from '@projectwallace/css-parser/walker'
import { is_function, is_identifier } from '@projectwallace/css-parser/node-types'
import { str_equals, str_starts_with } from '@projectwallace/css-parser/string-utils'

/**
 * CSS properties whose declaration values may contain color values.
 * Used to filter walkDecls so only relevant declarations are visited.
 */
export const COLOR_PROPERTIES: RegExp =
	/^(?:color|background(?:-color|-image)?|border(?:-color|-top(?:-color)?|-right(?:-color)?|-bottom(?:-color)?|-left(?:-color)?|-block(?:-color|-start(?:-color)?|-end(?:-color)?)?|-inline(?:-color|-start(?:-color)?|-end(?:-color)?)?)?|outline(?:-color)?|text-decoration(?:-color)?|column-rule(?:-color)?|caret-color|fill|stroke|stop-color|flood-color|lighting-color|text-emphasis(?:-color)?|scrollbar-color|accent-color|box-shadow|text-shadow|filter|-webkit-text-fill-color|-webkit-tap-highlight-color|-webkit-text-stroke(?:-color)?|--.+)$/i

export type ColorCallback = (color: string, format: string) => void

/**
 * The analyzer tells hex colors apart by length (`hex3`, `hex6`, ...) and names `transparent` and
 * `currentcolor` after themselves; for counting formats those are 'hex' and 'system'.
 */
function to_format(format: string): string {
	if (str_starts_with('hex', format)) {
		return 'hex'
	}
	if (str_equals('transparent', format) || str_equals('currentcolor', format)) {
		return 'system'
	}
	return format
}

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
		format: to_format(match.format),
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
