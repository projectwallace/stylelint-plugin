import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_valid_non_negative_integer } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-comment-size'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected a comment size of no more than ${expected} characters but found ${actual}`,
})

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

		if (!validOptions) {
			return
		}

		let total_size = 0

		root.walkComments((comment) => {
			if (secondaryOptions?.ignoreCopyrightComments && comment.text.startsWith('!')) {
				return
			}
			total_size += comment.source!.end!.offset - comment.source!.start!.offset
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

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
