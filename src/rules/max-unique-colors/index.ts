import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import {
	is_allowed,
	is_valid_positive_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { collect_colors, collect_registered_colors } from '../../utils/collect-colors.js'
import { parse_value_of } from '../../utils/parse.js'
import { define_rule } from '../../utils/define-rule.js'
import { UniqueTracker } from '../../utils/unique-tracker.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-unique-colors'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique colors but found ${actual}`,
})

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

		const unique_colors = new UniqueTracker(primaryOption)

		const color_custom_properties = collect_registered_colors(root)

		const violating_declarations: Array<{ declaration: Declaration; word: string }> = []

		root.walkDecls((declaration) => {
			unique_colors.begin()
			let triggering_color = declaration.value
			collect_colors(
				declaration.prop,
				parse_value_of(declaration),
				true,
				color_custom_properties,
				(color) => {
					if (!is_allowed(color, ignore)) {
						if (unique_colors.add(color)) {
							triggering_color = color
						}
					}
				},
			)
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

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
