import { namedColors, colorFunctions, colorKeywords } from '@projectwallace/css-analyzer/values'
import {
	parse_value,
	walk,
	SKIP,
	is_function,
	is_hash,
	is_identifier,
} from '@projectwallace/css-parser'

/**
 * CSS properties whose declaration values may contain color values.
 * Used to filter walkDecls so only relevant declarations are visited.
 */
export const COLOR_PROPERTIES =
	/^(?:color|background(?:-color|-image)?|border(?:-color|-top(?:-color)?|-right(?:-color)?|-bottom(?:-color)?|-left(?:-color)?|-block(?:-color|-start(?:-color)?|-end(?:-color)?)?|-inline(?:-color|-start(?:-color)?|-end(?:-color)?)?)?|outline(?:-color)?|text-decoration(?:-color)?|column-rule(?:-color)?|caret-color|fill|stroke|stop-color|flood-color|lighting-color|text-emphasis(?:-color)?|scrollbar-color|accent-color|box-shadow|text-shadow|filter|-webkit-text-fill-color|-webkit-tap-highlight-color|-webkit-text-stroke(?:-color)?|--.+)$/i

export type ColorCallback = (color: string, format: string) => void

/**
 * Walk a parsed CSS value and invoke `callback` for each detected color token,
 * passing the full color string and its format ('hex', 'named', 'system', or a
 * function name like 'rgb'/'hsl'/'oklch'/'color').
 *
 * Composing functions such as color-mix() and light-dark() are transparent:
 * the walker descends into their arguments so inner color tokens are reported.
 *
 * When `resolve_var` is true, var() references to known @property <color>
 * custom properties are also reported as format 'var'. CSS does not allow
 * var() in @property initial-value, so pass false when scanning initial-value.
 */
export function collect_colors(
	parsed: ReturnType<typeof parse_value>,
	resolve_var: boolean,
	color_custom_properties: Set<string>,
	callback: ColorCallback,
): void {
	walk(parsed, (node) => {
		if (is_hash(node)) {
			callback(node.text, 'hex')
		} else if (is_identifier(node)) {
			const ident = node.text
			if (namedColors.has(ident)) {
				callback(ident, 'named')
			} else if (colorKeywords.has(ident)) {
				callback(ident, 'system')
			}
		} else if (is_function(node)) {
			const fn_name = node.name
			if (fn_name === undefined) return
			const fn = node.text
			const fn_name_lower = fn_name.toLowerCase()

			if (colorFunctions.has(fn_name)) {
				// Numeric-channel color functions (rgb, hsl, oklch, …).
				// SKIP children — they are numbers, not color tokens.
				callback(fn, fn_name_lower)
				return SKIP
			}

			if (resolve_var && fn_name_lower === 'var') {
				// var() referencing a custom property declared as <color> via @property.
				// Do NOT skip children so fallback color values are still evaluated.
				const first = node.first_child
				if (first !== null && is_identifier(first) && color_custom_properties.has(first.text)) {
					callback(fn, 'var')
				}
			}
			// All other functions (color-mix, light-dark, gradients, …) are
			// transparent: the walker descends naturally into their arguments.
		}
	})
}
