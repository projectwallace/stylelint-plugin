import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import { isAllowed } from '../../utils/allow-list.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unused-layers'

const messages = utils.ruleMessages(rule_name, {
	rejected: (layer: string) => `Layer "${layer}" was declared but never defined`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unused-layers/README.md',
}

interface SecondaryOptions {
	allowlist?: Array<string | RegExp>
}

const ruleFunction = (primaryOptions: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		const declared_layers = new Map<string, AtRule>()
		const defined_layers = new Set<string>()

		root.walkAtRules('layer', (atRule) => {
			if (atRule.nodes !== undefined) {
				// Block rule: @layer name { ... }
				const name = atRule.params.trim()
				if (name) {
					defined_layers.add(name)
				}
			} else {
				// Statement: @layer name; or @layer a, b, c;
				const names = atRule.params
					.split(',')
					.map((n) => n.trim())
					.filter(Boolean)
				for (const name of names) {
					if (!declared_layers.has(name)) {
						declared_layers.set(name, atRule)
					}
				}
			}
		})

		for (const [layer, node] of declared_layers) {
			if (defined_layers.has(layer)) continue
			if (secondaryOptions?.allowlist && isAllowed(layer, secondaryOptions.allowlist)) continue

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(layer),
				node,
				word: layer,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
