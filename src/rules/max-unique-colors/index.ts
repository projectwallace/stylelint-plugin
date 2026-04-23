import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { namedColors, colorFunctions, colorKeywords } from '@projectwallace/css-analyzer/values'
import { isAllowed as isIgnored } from '../../utils/allow-list.js'
import {
	parse_value,
	walk,
	SKIP,
	is_function,
	is_hash,
	is_identifier,
} from '@projectwallace/css-parser'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-colors'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, colors: string[]) =>
		`Found ${actual} unique colors (${colors.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-colors/README.md',
}

/**
 * Color functions not included in css-analyzer's colorFunctions because they
 * accept color values as arguments rather than numeric channel components.
 * We must return SKIP after counting them so their inner color tokens are not
 * also counted as separate unique colors.
 */
const COLOR_COMPOSING_FUNCTIONS = new Set(['color-mix', 'light-dark', 'device-cmyk'])

/**
 * CSS properties whose declaration values may contain color values.
 * Used to filter walkDecls so only relevant declarations are visited.
 */
const COLOR_PROPERTIES =
	/^(?:color|background(?:-color|-image)?|border(?:-color|-top(?:-color)?|-right(?:-color)?|-bottom(?:-color)?|-left(?:-color)?|-block(?:-color|-start(?:-color)?|-end(?:-color)?)?|-inline(?:-color|-start(?:-color)?|-end(?:-color)?)?)?|outline(?:-color)?|text-decoration(?:-color)?|column-rule(?:-color)?|caret-color|fill|stroke|stop-color|flood-color|lighting-color|text-emphasis(?:-color)?|scrollbar-color|accent-color|box-shadow|text-shadow|filter|-webkit-text-fill-color|-webkit-tap-highlight-color|-webkit-text-stroke(?:-color)?|--.+)$/i

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const ruleFunction = (primaryOption: number, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(
			result,
			rule_name,
			{
				actual: primaryOption,
				possible: [Number as unknown as (v: unknown) => boolean],
			},
			{
				actual: secondaryOptions,
				possible: {
					ignore: [
						String as unknown as (v: unknown) => boolean,
						(v: unknown) => v instanceof RegExp,
					],
				},
				optional: true,
			},
		)

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 0) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []

		/**
		 * Collect custom properties declared as @property { syntax: '<color>' }.
		 * var() references to these are recognised as color values.
		 */
		const color_custom_properties = new Set<string>()
		const unique_colors = new Set<string>()

		/**
		 * Walk a parsed CSS value and add any detected color tokens to unique_colors.
		 * When `resolve_var` is true, var() references to known @property <color>
		 * custom properties are also counted. CSS does not allow var() in
		 * @property initial-value, so pass false when scanning initial-value.
		 */
		function collect_colors(parsed: ReturnType<typeof parse_value>, resolve_var: boolean): void {
			walk(parsed, (node) => {
				if (is_hash(node)) {
					const hash = node.text
					// The parser already guarantees HASH nodes are valid hex colors.
					if (!isIgnored(hash, ignore)) {
						unique_colors.add(hash)
					}
				} else if (is_identifier(node)) {
					const ident = node.text
					// namedColors and colorKeywords both perform case-insensitive matching.
					if (namedColors.has(ident) || colorKeywords.has(ident)) {
						if (!isIgnored(ident, ignore)) {
							unique_colors.add(ident)
						}
					}
				} else if (is_function(node)) {
					const fn_name = node.name
					if (fn_name === undefined) return
					const fn = node.text

					// colorFunctions.has() is case-insensitive.
					if (colorFunctions.has(fn_name)) {
						// Numeric-channel color functions (rgb, hsl, oklch, …).
						// SKIP children — they are numbers, not color tokens.
						if (!isIgnored(fn, ignore)) {
							unique_colors.add(fn)
						}
						return SKIP
					}

					const fn_name_lower = fn_name.toLowerCase()

					if (COLOR_COMPOSING_FUNCTIONS.has(fn_name_lower)) {
						// Composing color functions (color-mix, light-dark, device-cmyk) take
						// color values as arguments. SKIP children so they are not double-counted.
						if (!isIgnored(fn, ignore)) {
							unique_colors.add(node.text)
						}
						return SKIP
					}

					if (resolve_var && fn_name_lower === 'var') {
						// var() referencing a custom property declared as <color> via @property.
						// Count the whole var() expression, but do NOT skip children so that
						// any fallback color values are still evaluated.
						const first = node.first_child
						if (first !== null && is_identifier(first) && color_custom_properties.has(first.text)) {
							if (!isIgnored(fn, ignore)) {
								unique_colors.add(fn)
							}
						}
					}
				}
			})
		}

		root.walkAtRules('property', (atRule) => {
			const prop_name = atRule.params.trim()
			if (!prop_name.startsWith('--')) return

			atRule.walkDecls('syntax', (decl) => {
				// syntax values may be quoted: '"<color>"' or "'<color>'"
				const syntax = decl.value.trim().replace(/^['"]|['"]$/g, '')
				if (syntax === '<color>') {
					color_custom_properties.add(prop_name)
				}
			})

			if (!color_custom_properties.has(prop_name)) return

			atRule.walkDecls('initial-value', (decl) => {
				collect_colors(parse_value(decl.value), false)
			})
		})

		const violating_declarations: Declaration[] = []

		root.walkDecls(COLOR_PROPERTIES, (declaration) => {
			const before = unique_colors.size
			collect_colors(parse_value(declaration.value), true)
			if (unique_colors.size > before && unique_colors.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		const actual = unique_colors.size
		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_colors]),
				node: declaration,
				result,
				ruleName: rule_name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
