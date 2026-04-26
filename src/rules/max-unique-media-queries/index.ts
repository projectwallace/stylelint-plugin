import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_non_negative_integer,
} from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-media-queries'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, queries: string[]) =>
		`Found ${actual} unique media queries (${queries.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-media-queries/README.md',
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
		const unique_queries = new Set<string>()
		const violating_at_rules: AtRule[] = []

		root.walkAtRules('media', (atRule) => {
			const before = unique_queries.size
			if (!is_allowed(atRule.params, ignore)) {
				unique_queries.add(atRule.params)
			}
			if (unique_queries.size > before && unique_queries.size > primaryOption) {
				violating_at_rules.push(atRule)
			}
		})

		const actual = unique_queries.size
		for (const atRule of violating_at_rules) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_queries]),
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
