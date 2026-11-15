import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_anchor_names } from '@projectwallace/css-analyzer/values'
import { define_rule } from '../../utils/define-rule.js'
import { get_value_offset } from '../../utils/offsets.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-anchor-names'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate anchor name "${name}"`,
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

		root.walkDecls(/^anchor-name$/i, (declaration) => {
			const value_offset = get_value_offset(declaration)
			for (const { value: name, offset, length } of get_anchor_names(declaration.value)) {
				if (seen.has(name)) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(name),
						node: declaration,
						index: value_offset + offset,
						endIndex: value_offset + offset + length,
					})
				} else {
					seen.add(name)
				}
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
