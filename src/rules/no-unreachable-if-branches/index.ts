import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk_values } from '@projectwallace/css-parser/walker'
import { is_function, is_if_branch } from '@projectwallace/css-parser'
import { str_equals } from '@projectwallace/css-parser/string-utils'
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

			const parsed = parse_value(declaration.value)

			walk_values(parsed, (node) => {
				if (!is_function(node) || !str_equals('if', node.name)) {
					return
				}

				for (const branch of node) {
					if (is_if_branch(branch) && branch.is_else && branch.has_next) {
						utils.report({
							result,
							ruleName: rule_name,
							message: messages.rejected(),
							node: declaration,
							word: branch.text,
						})
					}
				}
			})
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
