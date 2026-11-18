import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_if_functions } from '@projectwallace/css-analyzer/values'
import { has_if_function } from '../../utils/has-if-function.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-unreachable-if-branches'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Unexpected else condition that is not the last branch in if()`,
})

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		root.walkDecls((declaration) => {
			if (!has_if_function(declaration.value)) {
				return
			}

			for (const { misplaced_else } of get_if_functions(declaration.value)) {
				for (const { value } of misplaced_else) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(),
						node: declaration,
						word: value,
					})
				}
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
