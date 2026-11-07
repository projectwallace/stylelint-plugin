import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk, NUMBER } from '@projectwallace/css-parser'
import { define_rule } from '../../utils/define-rule.js'
import { walk_decls } from '../../utils/walk.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-invalid-z-index'

const INT32_MIN = -2147483648
const INT32_MAX = 2147483647

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

		walk_decls(root, ['z-index'], (declaration) => {
			const parsed = parse_value(declaration.value)

			walk(parsed, (node) => {
				if (node.type !== NUMBER) {
					return
				}

				const num = node.value
				if (num === null) {
					return
				}

				if (!Number.isInteger(num) || num < INT32_MIN || num > INT32_MAX) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(num),
						node: declaration,
						word: node.text,
					})
				}
			})
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
