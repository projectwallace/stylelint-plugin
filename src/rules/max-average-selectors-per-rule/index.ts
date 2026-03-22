import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_selector } from '@projectwallace/css-parser/parse-selector'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-average-selectors-per-rule'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Average selectors per rule is ${actual} which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-average-selectors-per-rule/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [Number as unknown as (v: unknown) => boolean],
		})

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 0) {
			return
		}

		let total_selectors = 0
		let rule_count = 0

		root.walkRules((rule) => {
			const parsed = parse_selector(rule.selector)
			total_selectors += parsed.children.length
			rule_count++
		})

		if (rule_count === 0) return

		const actual = total_selectors / rule_count

		if (actual > primaryOption) {
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
