import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk } from '@projectwallace/css-parser/walker'
import { is_function, is_if_branch } from '@projectwallace/css-parser'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-missing-if-else'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Expected if() to have an else condition`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-missing-if-else/README.md',
}

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) return

		root.walkDecls((declaration) => {
			if (!/if\(/i.test(declaration.value)) return

			const parsed = parse_value(declaration.value)

			walk(parsed, (node) => {
				if (!is_function(node) || node.name.toLowerCase() !== 'if') return

				let has_else = false
				for (const child of node) {
					if (is_if_branch(child) && child.is_else) {
						has_else = true
						break
					}
				}

				if (!has_else) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(),
						node: declaration,
						word: node.text,
					})
				}
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
