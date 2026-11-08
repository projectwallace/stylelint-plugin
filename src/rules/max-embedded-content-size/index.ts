import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { walk_values } from '@projectwallace/css-parser/walker'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { is_url } from '@projectwallace/css-parser'
import { is_valid_positive_integer } from '../../utils/option-validators.js'
import { str_index_of } from '@projectwallace/css-parser/string-utils'
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
			const parsed = parse_value(declaration.value)

			walk_values(parsed, (node) => {
				if (!is_url(node)) {
					return
				}
				const url = node.text
				if (str_index_of('data:', url) !== -1) {
					total_size += url.length
				}
			})
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
