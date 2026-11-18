import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_invalid_z_indexes } from '@projectwallace/css-analyzer/extract'
import { define_rule } from '../../utils/define-rule.js'
import { get_value_offset } from '../../utils/offsets.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-invalid-z-index'

const messages = utils.ruleMessages(rule_name, {
	rejected: (value: number) =>
		`Unexpected invalid z-index value "${value}": expected a 32-bit integer`,
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

		root.walkDecls(/^z-index$/i, (declaration) => {
			const value_offset = get_value_offset(declaration)
			for (const { value, offset, length } of get_invalid_z_indexes(
				declaration.prop,
				declaration.value,
			)) {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(value),
					node: declaration,
					index: value_offset + offset,
					endIndex: value_offset + offset + length,
				})
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
