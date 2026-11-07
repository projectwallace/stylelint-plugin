import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_valid_ratio } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/min-declaration-uniqueness-ratio'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected a declaration uniqueness ratio of at least ${expected} but got ${actual}`,
})

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_ratio],
		})

		if (!validOptions) {
			return
		}

		const unique_declarations = new Set<string>()
		let total_count = 0

		root.walkDecls((decl) => {
			unique_declarations.add(`${decl.prop}:${decl.value.trim()}`)
			total_count++
		})

		if (total_count === 0) {
			return
		}

		const actual = unique_declarations.size / total_count

		if (actual < primaryOption) {
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node: root,
				result,
				ruleName: rule_name,
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
