import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_property_name } from '@projectwallace/css-analyzer/atrules'
import { define_rule } from '../../utils/define-rule.js'
import { get_params_offset } from '../../utils/offsets.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-registered-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate @property registration "${name}"`,
})

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
			const match = get_property_name(at_rule.params)
			if (!match) {
				return
			}
			const name = match.value

			if (seen.has(name)) {
				const params_offset = get_params_offset(at_rule)
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(name),
					node: at_rule,
					index: params_offset + match.offset,
					endIndex: params_offset + match.offset + match.length,
				})
			} else {
				seen.add(name)
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
