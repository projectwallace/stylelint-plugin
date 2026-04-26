import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_selector } from '@projectwallace/css-parser/parse-selector'
import { getComplexity } from '@projectwallace/css-analyzer/selectors'
import { is_valid_positive_integer } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-average-selector-complexity'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Average selector complexity is ${actual} which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-average-selector-complexity/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_positive_integer],
		})

		if (!validOptions) return

		let total_complexity = 0
		let selector_count = 0

		root.walkRules((rule) => {
			const parsed = parse_selector(rule.selector)

			for (const selector of parsed.children) {
				total_complexity += getComplexity(selector)
				selector_count++
			}
		})

		if (selector_count === 0) return

		const actual = total_complexity / selector_count

		if (actual > primaryOption) {
			utils.report({
				message: messages.rejected(actual, primaryOption),
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
