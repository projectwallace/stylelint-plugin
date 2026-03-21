import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import { LAYER_NAME } from '@projectwallace/css-parser/nodes'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-anonymous-layers'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Anonymous @layer is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-anonymous-layers/README.md',
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
			const ast = parse_atrule_prelude('import', params)

			for (const node of ast) {
				if (node.type === LAYER_NAME && !node.name) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(),
						node: atRule,
						word: 'layer',
					})
				}
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
