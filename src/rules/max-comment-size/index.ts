import stylelint from 'stylelint'
import type { Root } from 'postcss'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-comment-size'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Comment size is ${actual} bytes which is greater than the allowed ${expected} bytes`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-comment-size/README.md',
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

		let total_size = 0

		root.walkComments((comment) => {
			total_size += comment.text.length
		})

		if (total_size > primaryOption) {
			utils.report({
				message: messages.rejected(total_size, primaryOption),
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
