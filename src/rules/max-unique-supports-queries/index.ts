import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import {
	is_allowed,
	is_valid_non_negative_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'
import { UniqueTracker } from '../../utils/unique-tracker.js'
import { walk_atrules } from '../../utils/walk.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-unique-supports-queries'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique supports queries but found ${actual}`,
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
		const unique_queries = new UniqueTracker(primaryOption)
		const violating_at_rules: AtRule[] = []

		walk_atrules(root, ['supports'], (at_rule) => {
			unique_queries.begin()
			if (!is_allowed(at_rule.params, ignore)) {
				unique_queries.add(at_rule.params)
			}
			if (unique_queries.exceeded()) {
				violating_at_rules.push(at_rule)
			}
		})

		const actual = unique_queries.size
		for (const at_rule of violating_at_rules) {
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node: at_rule,
				result,
				ruleName: rule_name,
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
