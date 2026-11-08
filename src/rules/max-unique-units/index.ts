import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { walk_values, DIMENSION } from '@projectwallace/css-parser'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { is_valid_positive_integer } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'
import { UniqueTracker } from '../../utils/unique-tracker.js'
import { get_value_offset } from '../../utils/offsets.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-unique-units'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique units but found ${actual}`,
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

		const unique_units = new UniqueTracker(primaryOption)
		const violating_declarations: Array<{ declaration: Declaration; start: number; end: number }> =
			[]

		root.walkDecls((declaration) => {
			unique_units.begin()
			const parsed = parse_value(declaration.value)
			let trigger_start = 0
			let trigger_end = declaration.value.length

			walk_values(parsed, (node) => {
				if (node.type === DIMENSION) {
					const unit = node.unit
					if (unit !== undefined) {
						const normalised = unit.toLowerCase()
						if (unique_units.add(normalised)) {
							trigger_start = node.start
							trigger_end = node.end
						}
					}
				}
			})

			if (unique_units.exceeded()) {
				violating_declarations.push({ declaration, start: trigger_start, end: trigger_end })
			}
		})

		const actual = unique_units.size
		for (const { declaration, start, end } of violating_declarations) {
			const value_offset = get_value_offset(declaration)
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node: declaration,
				index: value_offset + start,
				endIndex: value_offset + end,
				result,
				ruleName: rule_name,
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
