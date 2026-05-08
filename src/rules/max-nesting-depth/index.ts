import stylelint from 'stylelint'
import type { Root, Node } from 'postcss'
import { is_valid_non_negative_integer } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-nesting-depth'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Nesting depth ${actual} exceeds maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-nesting-depth/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_non_negative_integer],
		})

		if (!validOptions) return

		root.walk((node) => {
			if (node.type !== 'rule' && node.type !== 'atrule') return

			let depth = 0
			let current: Node | undefined = node.parent
			while (current) {
				if (current.type === 'rule' || current.type === 'atrule') {
					depth++
				}
				current = current.parent
			}

			if (depth > primaryOption) {
				utils.report({
					message: messages.rejected(depth, primaryOption),
					node,
					result,
					ruleName: rule_name,
				})
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
