import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_selector } from '@projectwallace/css-parser/parse-selector'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-selectors-per-rule'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Selectors per rule is ${actual} which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-selectors-per-rule/README.md',
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

		root.walkRules((rule) => {
			const parsed = parse_selector(rule.selector)
			const actual = parsed.children.length

			if (actual > primaryOption) {
				utils.report({
					message: messages.rejected(actual, primaryOption),
					node: rule,
					result,
					ruleName: rule_name,
				})
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
