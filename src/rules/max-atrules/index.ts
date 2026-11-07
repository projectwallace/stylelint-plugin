import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_valid_non_negative_integer } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-atrules'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} at-rules but found ${actual}`,
})

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_non_negative_integer],
		})

		if (!validOptions) {
			return
		}

		let actual = 0
		root.walkAtRules(() => {
			actual++
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

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
