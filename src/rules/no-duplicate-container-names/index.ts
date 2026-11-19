import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_declared_container_names } from '@projectwallace/css-analyzer/values'
import { define_rule } from '../../utils/define-rule.js'
import { get_value_offset } from '../../utils/offsets.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-container-names'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate container name "${name}"`,
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

		root.walkDecls(/^container(-name)?$/i, (declaration) => {
			const value_offset = get_value_offset(declaration)
			for (const { value: name, start_offset, end_offset } of get_declared_container_names(
				declaration.value,
			)) {
				if (seen.has(name)) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(name),
						node: declaration,
						index: value_offset + start_offset,
						endIndex: value_offset + end_offset,
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
