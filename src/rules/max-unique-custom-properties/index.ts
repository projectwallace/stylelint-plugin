import stylelint from 'stylelint'
import type { Root, Declaration, AtRule } from 'postcss'
import { is_custom, str_equals } from '@projectwallace/css-parser'
import {
	is_allowed,
	is_valid_non_negative_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-unique-custom-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique custom properties but found ${actual}`,
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
		const unique = new Set<string>()
		const violations: Array<{ node: Declaration | AtRule; word: string }> = []

		function add(value: string, node: Declaration | AtRule, word: string) {
			if (unique.has(value) || is_allowed(value, ignore)) {
				return
			}
			unique.add(value)
			if (unique.size > primaryOption) {
				violations.push({ node, word })
			}
		}

		// Walk in source order so the reported node is the first one that crosses the limit
		root.walk((node) => {
			if (node.type === 'decl' && is_custom(node.prop)) {
				add(node.prop, node, node.prop)
			} else if (node.type === 'atrule' && str_equals('property', node.name)) {
				// @property --my-prop { … } registers a custom property
				const name = node.params.trim()
				if (is_custom(name)) {
					add(name, node, name)
				}
			}
		})

		const actual = unique.size
		for (const { node, word } of violations) {
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node,
				word,
				result,
				ruleName: rule_name,
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
