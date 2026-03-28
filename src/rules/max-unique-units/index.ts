import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { walk, DIMENSION } from '@projectwallace/css-parser'
import { parse_value } from '@projectwallace/css-parser/parse-value'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-units'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, units: string[]) =>
		`Found ${actual} unique CSS units (${units.join(', ')}) which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-units/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [Number as unknown as (v: unknown) => boolean],
		})

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 0) {
			return
		}

		const unique_units = new Set<string>()

		root.walkDecls((declaration) => {
			const parsed = parse_value(declaration.value)

			walk(parsed, (node) => {
				if (node.type === DIMENSION) {
					const unit = node.unit
					if (unit !== undefined) {
						unique_units.add(unit.toLowerCase())
					}
				}
			})
		})

		const actual = unique_units.size

		if (actual > primaryOption) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_units]),
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
