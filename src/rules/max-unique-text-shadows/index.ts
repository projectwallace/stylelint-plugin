import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { keywords } from '@projectwallace/css-analyzer/values'
import {
	is_allowed,
	is_valid_positive_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'
import { UniqueTracker } from '../../utils/unique-tracker.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-unique-text-shadows'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique text shadows but found ${actual}`,
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
			[is_valid_positive_integer],
		)

		if (!validOptions) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []
		const unique_shadows = new UniqueTracker(primaryOption)
		const violating_declarations: Declaration[] = []

		root.walkDecls(/^text-shadow$/i, (declaration) => {
			unique_shadows.begin()
			const value = declaration.value

			if (!keywords.has(value) && !is_allowed(value, ignore)) {
				unique_shadows.add(value)
			}

			if (unique_shadows.exceeded()) {
				violating_declarations.push(declaration)
			}
		})

		const actual = unique_shadows.size
		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node: declaration,
				word: declaration.value,
				result,
				ruleName: rule_name,
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
