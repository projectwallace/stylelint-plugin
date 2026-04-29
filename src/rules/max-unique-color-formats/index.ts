import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { is_valid_positive_integer } from '../../utils/option-validators.js'
import { parse_value } from '@projectwallace/css-parser'
import { collect_colors, COLOR_PROPERTIES } from '../../utils/collect-colors.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-color-formats'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, formats: string[]) =>
		`Found ${actual} unique color formats (${formats.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-color-formats/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_positive_integer],
		})
		if (!validOptions) return

		const color_custom_properties = new Set<string>()
		const unique_formats = new Set<string>()

		function run_collect(parsed: ReturnType<typeof parse_value>, resolve_var: boolean): void {
			collect_colors(parsed, resolve_var, color_custom_properties, (_color, format) => {
				unique_formats.add(format)
			})
		}

		root.walkAtRules('property', (atRule) => {
			const prop_name = atRule.params.trim()
			if (!prop_name.startsWith('--')) return

			atRule.walkDecls('syntax', (decl) => {
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
			const before = unique_formats.size
			run_collect(parse_value(declaration.value), true)
			if (unique_formats.size > before && unique_formats.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		const actual = unique_formats.size
		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_formats]),
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
