import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_positive_integer,
} from '../../utils/option-validators.js'
import { parse_value } from '@projectwallace/css-parser'
import { collect_colors, COLOR_PROPERTIES } from '../../utils/collect-colors.js'

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
		const validOptions = utils.validateOptions(
			result,
			rule_name,
			{
				actual: primaryOption,
				possible: [is_valid_positive_integer],
			},
			{
				actual: secondaryOptions,
				possible: {
					ignore: ignore_option_validators,
				},
				optional: true,
			},
		)

		if (!validOptions) return

		const ignore = secondaryOptions?.ignore ?? []

		/**
		 * Collect custom properties declared as @property { syntax: '<color>' }.
		 * var() references to these are recognised as color values.
		 */
		const color_custom_properties = new Set<string>()
		const unique_colors = new Set<string>()

		function run_collect(parsed: ReturnType<typeof parse_value>, resolve_var: boolean): void {
			collect_colors(parsed, resolve_var, color_custom_properties, (color) => {
				if (!is_allowed(color, ignore)) {
					unique_colors.add(color)
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
				run_collect(parse_value(decl.value), false)
			})
		})

		const violating_declarations: Declaration[] = []

		root.walkDecls(COLOR_PROPERTIES, (declaration) => {
			const before = unique_colors.size
			run_collect(parse_value(declaration.value), true)
			if (unique_colors.size > before && unique_colors.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		const actual = unique_colors.size
		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption),
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
