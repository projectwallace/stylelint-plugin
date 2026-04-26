import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_valid_positive_integer } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-lines-of-code'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Counted ${actual} Lines of Code which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-lines-of-code/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_positive_integer],
		})

		if (!validOptions) return

		let actual = 0
		root.walk((node) => {
			if (node.type === 'rule') {
				actual += node.selectors.length
			} else if (node.type === 'atrule' || node.type === 'decl') {
				actual++
			}
		})

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
