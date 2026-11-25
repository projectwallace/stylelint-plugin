import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { is_valid_positive_integer } from '../../utils/option-validators.js'
import { collect_colors, collect_registered_colors } from '../../utils/collect-colors.js'
import { parse_value_of } from '../../utils/parse.js'
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

		const unique_formats = new UniqueTracker(primaryOption)

		const color_custom_properties = collect_registered_colors(root)

		const violating_declarations: Array<{ declaration: Declaration; word: string }> = []

		root.walkDecls((declaration) => {
			unique_formats.begin()
			let triggering_color = declaration.value
			collect_colors(
				declaration.prop,
				parse_value_of(declaration),
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
