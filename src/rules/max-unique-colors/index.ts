import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk, SKIP } from '@projectwallace/css-parser'
import { FUNCTION, HASH, IDENTIFIER } from '@projectwallace/css-parser/nodes'
import { namedColors, colorFunctions, colorKeywords } from '@projectwallace/css-analyzer/values'
import { isAllowed } from '../../utils/allow-list.js'

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
		})

		const unique_colors = new Set<string>()

		root.walkDecls(COLOR_PROPERTIES, (declaration) => {
			const parsed = parse_value(declaration.value)

			walk(parsed, (node) => {
				if (node.type === HASH) {
					// The parser already guarantees HASH nodes are valid hex colors.
					if (!isAllowed(node.text, ignore)) {
						unique_colors.add(node.text)
					}
				} else if (node.type === IDENTIFIER) {
					// namedColors and colorKeywords both perform case-insensitive matching.
					if (namedColors.has(node.text) || colorKeywords.has(node.text)) {
						if (!isAllowed(node.text, ignore)) {
							unique_colors.add(node.text)
						}
					}
				} else if (node.type === FUNCTION) {
					const fn_name = node.name
					if (fn_name === undefined) return

					// node.name is compared case-insensitively by colorFunctions.has().
					if (colorFunctions.has(fn_name)) {
						// Numeric-channel color functions (rgb, hsl, oklch, …).
						// Return SKIP so we don't descend into their children — while those
						// children are numbers and wouldn't be mistaken for colors, being
						// consistent avoids surprises if the function appears in a complex value.
						if (!isAllowed(node.text, ignore)) {
							unique_colors.add(node.text)
						}
						return SKIP
					}

					const fn_name_lower = fn_name.toLowerCase()

					if (COLOR_COMPOSING_FUNCTIONS.has(fn_name_lower)) {
						// Composing color functions (color-mix, light-dark, device-cmyk) take
						// color values as arguments.  Count the whole expression as one unique
						// color and skip children so the inner colors are not double-counted.
						if (!isAllowed(node.text, ignore)) {
							unique_colors.add(node.text)
						}
						return SKIP
					}

					if (fn_name_lower === 'var') {
						// var() referencing a custom property declared as <color> via @property.
						// Count the whole var() expression, but do NOT skip children so that
						// any fallback color values are still evaluated.
						const first = node.first_child
						if (
							first !== null &&
							first.type === IDENTIFIER &&
							color_custom_properties.has(first.text)
						) {
							if (!isAllowed(node.text, ignore)) {
								unique_colors.add(node.text)
							}
						}
					}
				}
			})
		})

		const actual = unique_colors.size

		if (actual > primaryOption) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_colors]),
				node: root,
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
