import stylelint from 'stylelint'
import type { Root } from 'postcss'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-registered-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate @property registration "${name}"`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-duplicate-registered-properties/README.md',
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

		const seen = new Set<string>()

		root.walkAtRules(/^property$/i, (atRule) => {
			const name = atRule.params.trim()
			if (!name) return

			if (seen.has(name)) {
				const params_offset = 1 + atRule.name.length + (atRule.raws.afterName ?? ' ').length
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(name),
					node: atRule,
					index: params_offset + atRule.params.indexOf(name),
					endIndex: params_offset + atRule.params.indexOf(name) + name.length,
				})
			} else {
				seen.add(name)
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
