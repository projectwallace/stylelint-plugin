import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import {
	is_allowed,
	is_valid_positive_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { parse_value } from '@projectwallace/css-parser'
import { collect_colors, COLOR_PROPERTIES } from '../../utils/collect-colors.js'
import { unquote } from '../../utils/unquote.js'
import { is_custom } from '@projectwallace/css-parser/string-utils'
import { UniqueTracker } from '../../utils/unique-tracker.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-colors'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique colors but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-colors/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const ruleFunction = (primaryOption: number, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = validate_options_with_ignore(
			result,
			rule_name,
			primaryOption,
			secondaryOptions,
			[is_valid_positive_integer],
		)

		if (!validOptions) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []

		/**
		 * Collect custom properties declared as @property { syntax: '<color>' }.
		 * var() references to these are recognised as color values.
		 */
		const color_custom_properties = new Set<string>()
		const unique_colors = new UniqueTracker(primaryOption)

		function run_collect(parsed: ReturnType<typeof parse_value>, resolve_var: boolean): void {
			collect_colors(parsed, resolve_var, color_custom_properties, (color) => {
				if (!is_allowed(color, ignore)) {
					unique_colors.add(color)
				}
			})
		}

		root.walkAtRules(/^property$/i, (atRule) => {
			const prop_name = atRule.params.trim()
			if (!is_custom(prop_name)) {
				return
			}

			atRule.walkDecls(/^syntax$/i, (decl) => {
				// syntax values may be quoted: '"<color>"' or "'<color>'"
				const syntax = unquote(decl.value.trim())
				if (syntax === '<color>') {
					color_custom_properties.add(prop_name)
				}
			})

			if (!color_custom_properties.has(prop_name)) {
				return
			}

			atRule.walkDecls(/^initial-value$/i, (decl) => {
				run_collect(parse_value(decl.value), false)
			})
		})

		const violating_declarations: Array<{ declaration: Declaration; word: string }> = []

		root.walkDecls(COLOR_PROPERTIES, (declaration) => {
			unique_colors.begin()
			let triggering_color = declaration.value
			collect_colors(parse_value(declaration.value), true, color_custom_properties, (color) => {
				if (!is_allowed(color, ignore)) {
					if (unique_colors.add(color)) {
						triggering_color = color
					}
				}
			})
			if (unique_colors.exceeded()) {
				violating_declarations.push({ declaration, word: triggering_color })
			}
		})

		const actual = unique_colors.size
		for (const { declaration, word } of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node: declaration,
				word,
				result,
				ruleName: rule_name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

const plugin: stylelint.Plugin = createPlugin(rule_name, ruleFunction)

export default plugin
