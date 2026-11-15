import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { keywords } from '@projectwallace/css-analyzer/values'
import {
	is_allowed,
	validate_options_with_ignore,
	is_valid_non_negative_integer,
	is_valid_positive_integer,
} from './option-validators.js'
import { define_rule } from './define-rule.js'
import { UniqueTracker } from './unique-tracker.js'
import { get_value_offset } from './offsets.js'

const { utils } = stylelint

/** What an analyzer util found, and where in the value */
type Match = { value: string; offset: number; length: number }

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

interface UniqueRuleOptions {
	/** Fully qualified rule name, e.g. `projectwallace/max-unique-font-sizes` */
	rule_name: string
	/** What is counted, as used in the message: `unique <label>` */
	label: string
	/** The matches of one declaration; must return `[]` for properties it does not care about */
	extract: (property: string, value: string, declaration: Declaration) => Match[]
	/** Allow a limit of 0 (default: the limit must be at least 1) */
	allow_zero?: boolean
	/** Make values that are written differently but mean the same count as one */
	normalize?: (value: string) => string
}

/**
 * Create a `max-unique-*` rule: count the unique matches that `extract` finds per declaration and
 * report every declaration that pushes the total over the limit, at the match that did.
 */
export function define_unique_rule(options: UniqueRuleOptions): stylelint.Plugin {
	const { rule_name, label, extract, allow_zero = false, normalize } = options

	const messages = utils.ruleMessages(rule_name, {
		rejected: (actual: number, expected: number) =>
			`Expected no more than ${expected} unique ${label} but found ${actual}`,
	})

	const ruleFunction = (primaryOption: number, secondaryOptions?: SecondaryOptions) => {
		return (root: Root, result: stylelint.PostcssResult) => {
			const valid_options = validate_options_with_ignore(
				result,
				rule_name,
				primaryOption,
				secondaryOptions,
				[allow_zero ? is_valid_non_negative_integer : is_valid_positive_integer],
			)

			if (!valid_options) {
				return
			}

			const ignore = secondaryOptions?.ignore ?? []
			const unique = new UniqueTracker(primaryOption)
			const violations: Array<{ declaration: Declaration; offset: number; length: number }> = []

			root.walkDecls((declaration) => {
				const matches = extract(declaration.prop, declaration.value, declaration)
				if (matches.length === 0) {
					return
				}

				unique.begin()
				let trigger = { offset: 0, length: declaration.value.length }

				for (const { value, offset, length } of matches) {
					if (keywords.has(value) || is_allowed(value, ignore)) {
						continue
					}
					if (unique.add(normalize ? normalize(value) : value)) {
						trigger = { offset, length }
					}
				}

				if (unique.exceeded()) {
					violations.push({ declaration, ...trigger })
				}
			})

			const actual = unique.size
			for (const { declaration, offset, length } of violations) {
				const index = get_value_offset(declaration) + offset
				utils.report({
					message: messages.rejected(actual, primaryOption),
					node: declaration,
					index,
					endIndex: index + length,
					result,
					ruleName: rule_name,
				})
			}
		}
	}

	return define_rule(rule_name, ruleFunction, messages)
}
