import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { calculateSpecificity, compareSpecificity } from '@projectwallace/css-analyzer'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-average-specificity'

type Specificity = [number, number, number]

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: string, expected: string) =>
		`Average specificity is ${actual} which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-average-specificity/README.md',
}

function parse_option(option: string): Specificity | null {
	if (!/^\d+(\.\d+)?,\d+(\.\d+)?,\d+(\.\d+)?$/.test(option)) return null
	const parts = option.split(',').map(Number)
	return [parts[0], parts[1], parts[2]]
}

function format_specificity(s: Specificity): string {
	return `${s[0]},${s[1]},${s[2]}`
}

const ruleFunction = (primaryOption: string) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [(v: unknown) => typeof v === 'string' && parse_option(v) !== null],
		})

		if (!validOptions) return

		const max = parse_option(primaryOption)!

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
		if (compareSpecificity(average, max) < 0) {
			utils.report({
				message: messages.rejected(format_specificity(average), primaryOption),
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
