import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_valid_positive_integer } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-file-size'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected a file size of no more than ${expected} bytes but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-file-size/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_positive_integer],
		})

		if (!validOptions) return

		const actual = root.source!.input.css.length

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
