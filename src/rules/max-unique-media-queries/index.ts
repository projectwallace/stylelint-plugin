import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import {
	is_allowed,
	is_valid_non_negative_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { UniqueTracker } from '../../utils/unique-tracker.js'
import { get_params_offset } from '../../utils/offsets.js'
import { walk_atrules } from '../../utils/walk.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-media-queries'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique media queries but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-media-queries/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const ruleFunction = (primaryOption: number, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = validate_options_with_ignore(
			result,
			rule_name,
			primaryOption,
			secondaryOptions,
			[is_valid_non_negative_integer],
		)

		if (!validOptions) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []
		const unique_queries = new UniqueTracker(primaryOption)
		const violating_at_rules: AtRule[] = []

		walk_atrules(root, ['media'], (atRule) => {
			unique_queries.begin()
			if (!is_allowed(atRule.params, ignore)) {
				unique_queries.add(atRule.params)
			}
			if (unique_queries.exceeded()) {
				violating_at_rules.push(atRule)
			}
		})

		const actual = unique_queries.size
		for (const atRule of violating_at_rules) {
			const params_offset = get_params_offset(atRule)
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node: atRule,
				index: params_offset,
				endIndex: params_offset + atRule.params.length,
				result,
				ruleName: rule_name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

const plugin: stylelint.Plugin = createPlugin(rule_name, ruleFunction)

export default plugin
