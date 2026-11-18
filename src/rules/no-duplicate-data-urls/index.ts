import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_data_urls } from '@projectwallace/css-analyzer/values'
import { define_rule } from '../../utils/define-rule.js'
import { get_value_offset } from '../../utils/offsets.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-data-urls'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Unexpected duplicate data URL`,
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

		const seen = new Set<string>()

		root.walkDecls((declaration) => {
			const value_offset = get_value_offset(declaration)
			for (const { value, offset, length } of get_data_urls(declaration.value)) {
				if (seen.has(value)) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(),
						node: declaration,
						index: value_offset + offset,
						endIndex: value_offset + offset + length,
					})
				} else {
					seen.add(value)
				}
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
