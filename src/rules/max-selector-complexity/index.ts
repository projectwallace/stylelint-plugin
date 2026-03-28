import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_selector } from '@projectwallace/css-parser/parse-selector'
import { getComplexity } from '@projectwallace/css-analyzer/selectors'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-selector-complexity'

const messages = utils.ruleMessages(rule_name, {
	rejected: (selector: string, actual: number, expected: number) =>
		`Selector complexity of "${selector}" is ${actual} which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-selector-complexity/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [Number as unknown as (v: unknown) => boolean],
		})

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 1) {
			return
		}

		root.walkRules((rule) => {
			const selector_text = rule.selector
			if (!selector_text.trim()) return

			const selector_list = parse_selector(selector_text)

			for (const selector of selector_list.children) {
				const complexity = getComplexity(selector)
				const stringified = selector.text.replace(/\n/g, '')

				if (complexity > primaryOption) {
					utils.report({
						message: messages.rejected(stringified, complexity, primaryOption),
						node: rule,
						result,
						ruleName: rule_name,
					})
				}
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
