import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_selector } from '@projectwallace/css-parser/parse-selector'
import { getSpecificity, compareSpecificity } from '@projectwallace/css-analyzer/selectors'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-selector-specificity'

type Specificity = [number, number, number]

const messages = utils.ruleMessages(rule_name, {
	rejected: (selector: string, actual: string, expected: string) =>
		`Specificity of "${selector}" is [${actual}] which is greater than the allowed [${expected}]`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-selector-specificity/README.md',
}

function is_valid_specificity(v: unknown): boolean {
	return (
		Array.isArray(v) &&
		v.length === 3 &&
		v.every((n: unknown) => typeof n === 'number' && Number.isInteger(n) && n >= 0)
	)
}

const ruleFunction = (primaryOption: Specificity) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: is_valid_specificity,
		})

		if (!validOptions || !is_valid_specificity(primaryOption)) return

		root.walkRules((rule) => {
			const selector_text = rule.selector
			if (!selector_text.trim()) return

			const selector_list = parse_selector(selector_text)
			const specificities = getSpecificity(selector_list)

			for (let i = 0; i < specificities.length; i++) {
				const specificity = specificities[i]
				if (compareSpecificity(specificity, primaryOption) > 0) {
					utils.report({
						message: messages.rejected(
							selector_list.children[i]?.text,
							specificity.join(', '),
							primaryOption.join(', '),
						),
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
ruleFunction.primaryOptionArray = true

export default createPlugin(rule_name, ruleFunction)
