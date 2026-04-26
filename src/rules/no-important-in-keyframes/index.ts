import stylelint from 'stylelint'
import type { Root } from 'postcss'

const { createPlugin, utils } = stylelint
const rule_name = 'projectwallace/no-important-in-keyframes'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Unexpected !important inside @keyframes`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-important-in-keyframes/README.md',
}

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})
		if (!validOptions) return

		root.walkAtRules(/keyframes$/i, (keyframes) => {
			keyframes.walkDecls((decl) => {
				if (decl.important) {
					utils.report({
						message: messages.rejected(),
						node: decl,
						result,
						ruleName: rule_name,
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
