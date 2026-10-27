import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { FUNCTION, LAYER_NAME } from '@projectwallace/css-parser/nodes'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { str_equals } from '@projectwallace/css-parser/string-utils'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-anonymous-layers'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Unexpected anonymous @layer`,
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

		root.walkAtRules(/^(layer|import)$/i, (at_rule) => {
			if (str_equals('layer', at_rule.name)) {
				// Anonymous layer: has a block but no name (empty/missing params)
				if (at_rule.nodes !== undefined && !at_rule.params.trim()) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(),
						node: at_rule,
					})
				}
			} else {
				// Check @import for anonymous layer syntax
				const parsed = parse_atrule_prelude('import', at_rule.params)
				for (const child of parsed) {
					// Bare `layer` is a LayerName without a name, `layer()` is a Function without children
					const is_bare_layer = child.type === LAYER_NAME && !child.name
					const is_empty_layer_fn =
						child.type === FUNCTION && str_equals('layer', child.name) && !child.first_child
					if (is_bare_layer || is_empty_layer_fn) {
						utils.report({
							result,
							ruleName: rule_name,
							message: messages.rejected(),
							node: at_rule,
						})
					}
				}
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
