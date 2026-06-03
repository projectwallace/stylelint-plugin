import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import { is_allowed } from '../../utils/option-validators.js'
import { DefinedUsed } from '../../utils/defined-used.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unused-layers'

const messages = utils.ruleMessages(rule_name, {
	rejected: (layer: string) => `Layer "${layer}" was declared but never defined`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unused-layers/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
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

		const tracker = new DefinedUsed<AtRule>()

		root.walkAtRules('layer', (atRule) => {
			if (atRule.nodes !== undefined) {
				// Block rule: @layer name { ... }
				const name = atRule.params.trim()
				if (name) {
					tracker.use(name)
				}
			} else {
				// Statement: @layer name; or @layer a, b, c;
				const names = atRule.params
					.split(',')
					.map((n) => n.trim())
					.filter(Boolean)
				for (const name of names) {
					tracker.define(name, atRule)
				}
			}
		})

		for (const [layer, node] of tracker.unused()) {
			if (secondaryOptions?.ignore && is_allowed(layer, secondaryOptions.ignore)) {
				continue
			}

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
