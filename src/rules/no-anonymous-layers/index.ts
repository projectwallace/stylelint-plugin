import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'

const { createPlugin, utils } = stylelint

const rule_name = 'project-wallace/no-anonymous-layers'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Anonymous @layer is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin',
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

		root.walkAtRules('layer', (atRule: AtRule) => {
			// Anonymous layer: has a block (nodes defined) but no name (empty params)
			if (atRule.nodes !== undefined && atRule.params.trim() === '') {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(),
					node: atRule,
					word: '@layer',
				})
			}
		})

		root.walkAtRules('import', (atRule: AtRule) => {
			const params = atRule.params
			// Check for 'layer' keyword in @import params
			if (!/\blayer\b/.test(params)) return
			// Named layer uses function notation with no space: layer(name)
			// If params contain layer(non-empty), it's a named layer — not anonymous
			if (/\blayer\([^)]+\)/.test(params)) return
			// Otherwise: bare 'layer', 'layer()', or 'layer ' before a media query — anonymous
			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(),
				node: atRule,
				word: 'layer',
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
