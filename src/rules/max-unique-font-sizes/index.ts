import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { destructureFontShorthand, keywords } from '@projectwallace/css-analyzer/values'
import {
	is_allowed,
	is_valid_non_negative_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'
import { UniqueTracker } from '../../utils/unique-tracker.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-unique-font-sizes'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique font sizes but found ${actual}`,
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
		const unique_sizes = new UniqueTracker(primaryOption)
		const violating_declarations: Array<{ declaration: Declaration; word: string }> = []

		root.walkDecls(/^font-size$/i, (declaration) => {
			unique_sizes.begin()
			if (!keywords.has(declaration.value) && !is_allowed(declaration.value, ignore)) {
				unique_sizes.add(declaration.value)
			}
			if (unique_sizes.exceeded()) {
				violating_declarations.push({ declaration, word: declaration.value })
			}
		})

		root.walkDecls(/^font$/i, (declaration) => {
			unique_sizes.begin()
			const parsed = parse_value(declaration.value)
			const destructured = destructureFontShorthand(parsed, () => {})
			if (destructured?.font_size && !is_allowed(destructured.font_size, ignore)) {
				unique_sizes.add(destructured.font_size)
			}
			if (unique_sizes.exceeded()) {
				violating_declarations.push({
					declaration,
					word: destructured?.font_size ?? declaration.value,
				})
			}
		})

		const actual = unique_sizes.size
		for (const { declaration, word } of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node: declaration,
				word,
				result,
				ruleName: rule_name,
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
