import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import {
	is_allowed,
	is_valid_non_negative_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'
import { UniqueTracker } from '../../utils/unique-tracker.js'
import { get_params_offset } from '../../utils/offsets.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-unique-keyframes'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique keyframes but found ${actual}`,
})

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
		const unique_keyframes = new UniqueTracker(primaryOption)
		const violating_at_rules: AtRule[] = []

		root.walkAtRules(/^keyframes$/i, (atRule) => {
			unique_keyframes.begin()
			if (!is_allowed(atRule.params, ignore)) {
				unique_keyframes.add(atRule.params)
			}
			if (unique_keyframes.exceeded()) {
				violating_at_rules.push(atRule)
			}
		})

		const actual = unique_keyframes.size
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

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
