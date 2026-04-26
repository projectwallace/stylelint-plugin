import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_valid_ratio } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/min-selector-uniqueness-ratio'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Selector uniqueness ratio is ${actual} which is less than the required ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/min-selector-uniqueness-ratio/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_ratio],
		})

		if (!validOptions) return

		const unique_selectors = new Set<string>()
		let total_count = 0

		root.walkRules((rule) => {
			for (const selector of rule.selectors) {
				unique_selectors.add(selector.trim())
				total_count++
			}
		})

		if (total_count === 0) return

		const actual = unique_selectors.size / total_count

		if (actual < primaryOption) {
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
