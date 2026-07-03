import stylelint from 'stylelint'
import type { Root } from 'postcss'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-custom-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate custom property "${name}"`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-duplicate-custom-properties/README.md',
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

		root.walkDecls(/^--/, (decl) => {
			const name = decl.prop

			if (seen.has(name)) {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(name),
					node: decl,
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
