import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk } from '@projectwallace/css-parser/walker'
import { FUNCTION, HASH, IDENTIFIER } from '@projectwallace/css-parser/nodes'
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
 * CSS color function names. These are functions that produce a color value
 * and are counted as a single unique color (the whole expression).
 */
const COLOR_FUNCTIONS = new Set([
	'rgb',
	'rgba',
	'hsl',
	'hsla',
	'hwb',
	'lab',
	'lch',
	'oklab',
	'oklch',
	'color',
	'color-mix',
	'light-dark',
	'device-cmyk',
])

/**
 * All CSS named colors (lowercase), including special keywords
 * transparent and currentcolor.
 * Source: https://www.w3.org/TR/css-color-4/#named-colors
 */
const NAMED_COLORS = new Set([
	'aliceblue',
	'antiquewhite',
	'aqua',
	'aquamarine',
	'azure',
	'beige',
	'bisque',
	'black',
	'blanchedalmond',
	'blue',
	'blueviolet',
	'brown',
	'burlywood',
	'cadetblue',
	'chartreuse',
	'chocolate',
	'coral',
	'cornflowerblue',
	'cornsilk',
	'crimson',
	'cyan',
	'darkblue',
	'darkcyan',
	'darkgoldenrod',
	'darkgray',
	'darkgreen',
	'darkgrey',
	'darkkhaki',
	'darkmagenta',
	'darkolivegreen',
	'darkorange',
	'darkorchid',
	'darkred',
	'darksalmon',
	'darkseagreen',
	'darkslateblue',
	'darkslategray',
	'darkslategrey',
	'darkturquoise',
	'darkviolet',
	'deeppink',
	'deepskyblue',
	'dimgray',
	'dimgrey',
	'dodgerblue',
	'firebrick',
	'floralwhite',
	'forestgreen',
	'fuchsia',
	'gainsboro',
	'ghostwhite',
	'gold',
	'goldenrod',
	'gray',
	'green',
	'greenyellow',
	'grey',
	'honeydew',
	'hotpink',
	'indianred',
	'indigo',
	'ivory',
	'khaki',
	'lavender',
	'lavenderblush',
	'lawngreen',
	'lemonchiffon',
	'lightblue',
	'lightcoral',
	'lightcyan',
	'lightgoldenrodyellow',
	'lightgray',
	'lightgreen',
	'lightgrey',
	'lightpink',
	'lightsalmon',
	'lightseagreen',
	'lightskyblue',
	'lightslategray',
	'lightslategrey',
	'lightsteelblue',
	'lightyellow',
	'lime',
	'limegreen',
	'linen',
	'magenta',
	'maroon',
	'mediumaquamarine',
	'mediumblue',
	'mediumorchid',
	'mediumpurple',
	'mediumseagreen',
	'mediumslateblue',
	'mediumspringgreen',
	'mediumturquoise',
	'mediumvioletred',
	'midnightblue',
	'mintcream',
	'mistyrose',
	'moccasin',
	'navajowhite',
	'navy',
	'oldlace',
	'olive',
	'olivedrab',
	'orange',
	'orangered',
	'orchid',
	'palegoldenrod',
	'palegreen',
	'paleturquoise',
	'palevioletred',
	'papayawhip',
	'peachpuff',
	'peru',
	'pink',
	'plum',
	'powderblue',
	'purple',
	'rebeccapurple',
	'red',
	'rosybrown',
	'royalblue',
	'saddlebrown',
	'salmon',
	'sandybrown',
	'seagreen',
	'seashell',
	'sienna',
	'silver',
	'skyblue',
	'slateblue',
	'slategray',
	'slategrey',
	'snow',
	'springgreen',
	'steelblue',
	'tan',
	'teal',
	'thistle',
	'tomato',
	'turquoise',
	'violet',
	'wheat',
	'white',
	'whitesmoke',
	'yellow',
	'yellowgreen',
	// Special color keywords
	'transparent',
	'currentcolor',
])

/**
 * CSS properties whose declaration values may contain color values.
 * This is used to filter walkDecls to only visit relevant declarations.
 */
const COLOR_PROPERTIES =
	/^(?:color|background(?:-color|-image)?|border(?:-color|-top(?:-color)?|-right(?:-color)?|-bottom(?:-color)?|-left(?:-color)?|-block(?:-color|-start(?:-color)?|-end(?:-color)?)?|-inline(?:-color|-start(?:-color)?|-end(?:-color)?)?)?|outline(?:-color)?|text-decoration(?:-color)?|column-rule(?:-color)?|caret-color|fill|stroke|stop-color|flood-color|lighting-color|text-emphasis(?:-color)?|scrollbar-color|accent-color|box-shadow|text-shadow|filter|-webkit-text-fill-color|-webkit-tap-highlight-color|-webkit-text-stroke(?:-color)?|--.+)$/i

/**
 * Valid CSS hex color lengths after the '#': 3 (#RGB), 4 (#RGBA),
 * 6 (#RRGGBB), or 8 (#RRGGBBAA) hex digits.
 */
const HEX_COLOR_RE = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

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
		 * Collect custom properties defined as <color> via @property { syntax: '<color>' }.
		 * These are recognised as color values when referenced via var().
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
				let color: string | undefined

				if (node.type === HASH) {
					// Hex colors: #RGB, #RGBA, #RRGGBB, #RRGGBBAA
					if (HEX_COLOR_RE.test(node.text)) {
						color = node.text
					}
				} else if (node.type === IDENTIFIER) {
					// Named colors and special keywords (currentcolor, transparent).
					// Lookup is case-insensitive; the original casing is preserved for uniqueness.
					if (NAMED_COLORS.has(node.text.toLowerCase())) {
						color = node.text
					}
				} else if (node.type === FUNCTION) {
					const fn_name = node.name?.toLowerCase()

					if (fn_name !== undefined && COLOR_FUNCTIONS.has(fn_name)) {
						// Color functions such as rgb(), hsl(), oklch(), color-mix(), etc.
						color = node.text
					} else if (fn_name === 'var') {
						// var() referencing a custom property declared as <color> via @property
						const first = node.first_child
						if (
							first !== null &&
							first.type === IDENTIFIER &&
							color_custom_properties.has(first.text)
						) {
							color = node.text
						}
					}
				}

				if (color !== undefined && !isAllowed(color, ignore)) {
					unique_colors.add(color)
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
