import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_valid_non_negative_integer } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-comments'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Comment count is ${actual} which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-comments/README.md',
}

interface SecondaryOptions {
	ignoreCopyrightComments?: boolean
}

const ruleFunction = (primaryOption: number, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(
			result,
			rule_name,
			{
				actual: primaryOption,
				possible: [is_valid_non_negative_integer],
			},
			{
				actual: secondaryOptions,
				possible: {
					ignoreCopyrightComments: [true, false],
				},
				optional: true,
			},
		)

		if (!validOptions) return

		let total_count = 0

		root.walkComments((comment) => {
			if (secondaryOptions?.ignoreCopyrightComments && comment.text.startsWith('!')) return
			total_count++
		})

		if (total_count > primaryOption) {
			utils.report({
				message: messages.rejected(total_count, primaryOption),
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
