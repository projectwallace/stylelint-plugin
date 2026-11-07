import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_valid_ratio } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-important-ratio'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected an important ratio of no more than ${expected} but found ${actual}`,
})

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_ratio],
		})

		if (!validOptions) {
			return
		}

		let total_declarations = 0
		let important_declarations = 0

		root.walkDecls((declaration) => {
			total_declarations++
			if (declaration.important) {
				important_declarations++
			}
		})

		if (total_declarations === 0) {
			return
		}

		const actual = important_declarations / total_declarations

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
