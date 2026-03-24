import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { calculateSpecificity, compareSpecificity } from '@projectwallace/css-analyzer'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-average-specificity'

type Specificity = [number, number, number]

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: Specificity, expected: Specificity) =>
		`Average specificity is [${actual.join(', ')}] which is greater than the allowed [${expected.join(', ')}]`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-average-specificity/README.md',
}

function is_valid_specificity(v: unknown): boolean {
	return (
		Array.isArray(v) &&
		v.length === 3 &&
		v.every((n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0)
	)
}

const ruleFunction = (primaryOption: Specificity) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: is_valid_specificity,
		})

		if (!validOptions || !is_valid_specificity(primaryOption)) {
			return
		}

		const sum: Specificity = [0, 0, 0]
		let selector_count = 0

		root.walkRules((rule) => {
			const specificities = calculateSpecificity(rule.selector)
			for (const specificity of specificities) {
				sum[0] += specificity[0]
				sum[1] += specificity[1]
				sum[2] += specificity[2]
				selector_count++
			}
		})

		if (selector_count === 0) return

		const average: Specificity = [
			sum[0] / selector_count,
			sum[1] / selector_count,
			sum[2] / selector_count,
		]

		// compareSpecificity returns < 0 when first arg has higher specificity than second
		if (compareSpecificity(average, primaryOption) < 0) {
			utils.report({
				message: messages.rejected(average, primaryOption),
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
ruleFunction.primaryOptionArray = true

export default createPlugin(rule_name, ruleFunction)
