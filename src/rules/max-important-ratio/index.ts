import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { analyze } from '@projectwallace/css-analyzer'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-important-ratio'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`!important ratio is ${actual}% which is greater than the allowed ${expected}%`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-important-ratio/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [Number as unknown as (v: unknown) => boolean],
		})

		if (!validOptions || !Number.isFinite(primaryOption) || primaryOption < 0) {
			return
		}

		const analysis = analyze(root.source!.input.css)
		const actual = Math.round(analysis.declarations.importants.ratio * 10000) / 100

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
