import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_import_layer } from '@projectwallace/css-analyzer/atrules'
import { str_equals } from '@projectwallace/css-parser/string-utils'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-anonymous-layers'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Unexpected anonymous @layer`,
})

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
				// An @import with a bare `layer` or `layer()` is anonymous
				if (get_import_layer(at_rule.params)?.value === '') {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(),
						node: at_rule,
					})
				}
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
