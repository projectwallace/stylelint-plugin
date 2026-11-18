import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_valid_z_index } from '@projectwallace/css-analyzer/extract'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-invalid-z-index'

const messages = utils.ruleMessages(rule_name, {
	rejected: (value: string) =>
		`Unexpected invalid z-index value "${value}": expected a 32-bit integer`,
})

const ruleFunction = (primaryOptions: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		root.walkDecls(/^z-index$/i, (declaration) => {
			if (!is_valid_z_index(declaration.value)) {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(declaration.value.trim()),
					node: declaration,
					word: declaration.value.trim(),
				})
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
