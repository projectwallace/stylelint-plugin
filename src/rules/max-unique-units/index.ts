import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { walk, DIMENSION } from '@projectwallace/css-parser'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { is_valid_positive_integer } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-units'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique units but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-units/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_positive_integer],
		})

		if (!validOptions) return

		const unique_units = new Set<string>()
		const violating_declarations: Array<{ declaration: Declaration; start: number; end: number }> =
			[]

		root.walkDecls((declaration) => {
			const before = unique_units.size
			const parsed = parse_value(declaration.value)
			let trigger_start = 0
			let trigger_end = declaration.value.length

			walk(parsed, (node) => {
				if (node.type === DIMENSION) {
					const unit = node.unit
					if (unit !== undefined) {
						const normalised = unit.toLowerCase()
						const is_new = !unique_units.has(normalised)
						unique_units.add(normalised)
						if (is_new && unique_units.size > primaryOption) {
							trigger_start = node.start
							trigger_end = node.end
						}
					}
				}
			})

			if (unique_units.size > before && unique_units.size > primaryOption) {
				violating_declarations.push({ declaration, start: trigger_start, end: trigger_end })
			}
		})

		const actual = unique_units.size
		for (const { declaration, start, end } of violating_declarations) {
			const value_offset = declaration.prop.length + (declaration.raws.between ?? ': ').length
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

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
