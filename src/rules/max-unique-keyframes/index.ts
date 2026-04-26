import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_non_negative_integer,
} from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-keyframes'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, names: string[]) =>
		`Found ${actual} unique keyframes (${names.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-keyframes/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const ruleFunction = (primaryOption: number, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(
			result,
			rule_name,
			{
				actual: primaryOption,
				possible: [is_valid_non_negative_integer],
			},
			{
				actual: secondaryOptions,
				possible: {
					ignore: ignore_option_validators,
				},
				optional: true,
			},
		)

		if (!validOptions) return

		const ignore = secondaryOptions?.ignore ?? []
		const unique_keyframes = new Set<string>()
		const violating_at_rules: AtRule[] = []

		root.walkAtRules('keyframes', (atRule) => {
			const before = unique_keyframes.size
			if (!is_allowed(atRule.params, ignore)) {
				unique_keyframes.add(atRule.params)
			}
			if (unique_keyframes.size > before && unique_keyframes.size > primaryOption) {
				violating_at_rules.push(atRule)
			}
		})

		const actual = unique_keyframes.size
		for (const atRule of violating_at_rules) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_keyframes]),
				node: atRule,
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
