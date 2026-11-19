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
import { parse_value_of } from './parse.js'
import type { Value } from '@projectwallace/css-parser'
import { property_basename } from '@projectwallace/css-parser/string-utils'

const { utils } = stylelint

/** What an analyzer util found, and where in the value */
type Match = { value: string; start_offset: number; end_offset: number }

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

interface UniqueRuleOptions<M extends Match> {
	/** Fully qualified rule name, e.g. `projectwallace/max-unique-font-sizes` */
	rule_name: string
	/** What is counted, as used in the message: `unique <label>` */
	label: string
	/** The matches of one declaration; must return `[]` for properties it does not care about */
	/** The properties `extract` handles, to skip other declarations without parsing their value */
	properties?: { has: (property: string) => boolean }
	extract: (property: string, value: Value, declaration: Declaration) => M[]
	/** What identifies a match when counting (default: its `value`, the source text) */
	count_by?: (match: M) => string
	/** Allow a limit of 0 (default: the limit must be at least 1) */
	allow_zero?: boolean
	/** Make values that are written differently but mean the same count as one */
	normalize?: (value: string) => string
}

/**
 * Create a `max-unique-*` rule: count the unique matches that `extract` finds per declaration and
 * report every declaration that pushes the total over the limit, at the match that did.
 */
export function define_unique_rule<M extends Match>(
	options: UniqueRuleOptions<M>,
): stylelint.Plugin {
	const { rule_name, label, properties, extract, count_by, allow_zero = false, normalize } = options

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
			const violations: Array<{
				declaration: Declaration
				start_offset: number
				end_offset: number
			}> = []

			root.walkDecls((declaration) => {
				if (properties && !properties.has(property_basename(declaration.prop))) {
					return
				}
				const matches = extract(declaration.prop, parse_value_of(declaration), declaration)
				if (matches.length === 0) {
					return
				}

				unique.begin()
				let trigger = { start_offset: 0, end_offset: declaration.value.length }

				for (const match of matches) {
					const text = count_by ? count_by(match) : match.value
					if (keywords.has(text) || is_allowed(text, ignore)) {
						continue
					}
					if (unique.add(normalize ? normalize(text) : text)) {
						trigger = { start_offset: match.start_offset, end_offset: match.end_offset }
					}
				}

				if (unique.exceeded()) {
					violations.push({ declaration, ...trigger })
				}
			})

			const actual = unique.size
			for (const { declaration, start_offset, end_offset } of violations) {
				const value_offset = get_value_offset(declaration)
				utils.report({
					message: messages.rejected(actual, primaryOption),
					node: declaration,
					index: value_offset + start_offset,
					endIndex: value_offset + end_offset,
					result,
					ruleName: rule_name,
				})
			}
		}
	}

	return define_rule(rule_name, ruleFunction, messages)
}
