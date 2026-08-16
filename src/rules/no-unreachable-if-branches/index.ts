import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk } from '@projectwallace/css-parser/walker'
import { is_function, is_if_branch } from '@projectwallace/css-parser'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unreachable-if-branches'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Unexpected else condition that is not the last branch in if()`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unreachable-if-branches/README.md',
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

				const branches = node.children.filter(is_if_branch)
				const last_index = branches.length - 1

				branches.forEach((branch, index) => {
					if (branch.is_else && index !== last_index) {
						utils.report({
							result,
							ruleName: rule_name,
							message: messages.rejected(),
							node: declaration,
							word: branch.text,
						})
					}
				})
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
