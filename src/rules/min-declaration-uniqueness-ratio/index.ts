import stylelint from 'stylelint'
import type { Root } from 'postcss'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/min-declaration-uniqueness-ratio'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Declaration uniqueness ratio is ${actual} which is less than the required ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/min-declaration-uniqueness-ratio/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [(v: unknown) => typeof v === 'number' && !Number.isNaN(v as number)],
		})

		if (
			!validOptions ||
			!Number.isFinite(primaryOption) ||
			primaryOption < 0 ||
			primaryOption > 1
		) {
			return
		}

		const unique_declarations = new Set<string>()
		let total_count = 0

		root.walkDecls((decl) => {
			unique_declarations.add(`${decl.prop}:${decl.value.trim()}`)
			total_count++
		})

		if (total_count === 0) return

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

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
