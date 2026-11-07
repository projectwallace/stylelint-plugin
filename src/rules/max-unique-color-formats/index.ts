import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { is_valid_positive_integer } from '../../utils/option-validators.js'
import { parse_value } from '@projectwallace/css-parser'
import { collect_colors, COLOR_PROPERTIES } from '../../utils/collect-colors.js'
import { unquote } from '../../utils/unquote.js'
import { is_custom } from '@projectwallace/css-parser/string-utils'
import { define_rule } from '../../utils/define-rule.js'
import { UniqueTracker } from '../../utils/unique-tracker.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-unique-color-formats'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique color formats but found ${actual}`,
})

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_positive_integer],
		})
		if (!validOptions) {
			return
		}

		const color_custom_properties = new Set<string>()
		const unique_formats = new UniqueTracker(primaryOption)

		function run_collect(parsed: ReturnType<typeof parse_value>, resolve_var: boolean): void {
			collect_colors(parsed, resolve_var, color_custom_properties, (_color, format) => {
				unique_formats.add(format)
			})
		}

		root.walkAtRules(/^property$/i, (atRule) => {
			const prop_name = atRule.params.trim()
			if (!is_custom(prop_name)) {
				return
			}

			atRule.walkDecls(/^syntax$/i, (decl) => {
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
			unique_formats.begin()
			let triggering_color = declaration.value
			collect_colors(
				parse_value(declaration.value),
				true,
				color_custom_properties,
				(color, format) => {
					if (unique_formats.add(format)) {
						triggering_color = color
					}
				},
			)
			if (unique_formats.exceeded()) {
				violating_declarations.push({ declaration, word: triggering_color })
			}
		})

		const actual = unique_formats.size
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

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
