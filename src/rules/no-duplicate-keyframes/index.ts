import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { keywords } from '@projectwallace/css-analyzer/values'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-keyframes'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate @keyframes name "${name}"`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-duplicate-keyframes/README.md',
}

const ruleFunction = (primaryOptions: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		const seen = new Map<string, true>()

		root.walkAtRules(/^keyframes$/i, (atRule) => {
			const name = atRule.params.trim()
			if (!name || keywords.has(name.toLowerCase())) return

			if (seen.has(name)) {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(name),
					node: atRule,
					word: name,
				})
			} else {
				seen.set(name, true)
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
