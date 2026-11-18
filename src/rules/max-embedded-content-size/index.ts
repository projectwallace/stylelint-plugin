import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_data_urls } from '@projectwallace/css-analyzer/values'
import { is_valid_positive_integer } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-embedded-content-size'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected an embedded content size of no more than ${expected} bytes but found ${actual}`,
})

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_positive_integer],
		})

		if (!validOptions) {
			return
		}

		let total_size = 0

		root.walkDecls((declaration) => {
			for (const { value } of get_data_urls(declaration.value)) {
				total_size += value.length
			}
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
