import { createPlugin, utils } from '../../utils/stylelint.js'
import type stylelint from 'stylelint'
import type { Root } from 'postcss'

const rule_name = 'projectwallace/no-duplicate-registered-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate @property registration "${name}"`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-duplicate-registered-properties/README.md',
}

const ruleFunction = (primaryOptions: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const valid_options = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!valid_options) {
			return
		}

		const seen = new Set<string>()

		root.walkAtRules(/^property$/i, (at_rule) => {
			const name = at_rule.params.trim()
			if (!name) {
				return
			}

			if (seen.has(name)) {
				const params_offset = 1 + at_rule.name.length + (at_rule.raws.afterName ?? ' ').length
				const name_offset = at_rule.params.indexOf(name)
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(name),
					node: at_rule,
					index: params_offset + name_offset,
					endIndex: params_offset + name_offset + name.length,
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
