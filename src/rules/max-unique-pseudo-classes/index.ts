import stylelint from 'stylelint'
import type { Root, Rule } from 'postcss'
import { walk, parse_selector_list, is_pseudo_class_selector } from '@projectwallace/css-parser'
import { is_keyframe_rule } from '../../utils/is-keyframe-rule.js'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_non_negative_integer,
} from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-pseudo-classes'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique pseudo-classes but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-pseudo-classes/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

// Legacy single-colon notation of pseudo-elements, which parse as pseudo-classes
const LEGACY_PSEUDO_ELEMENTS = new Set(['before', 'after', 'first-line', 'first-letter'])

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

		if (!validOptions) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []
		const unique = new Set<string>()
		const violations: Array<{ node: Rule; word: string }> = []

		function add(value: string, node: Rule, word: string) {
			if (unique.has(value) || is_allowed(value, ignore)) {
				return
			}
			unique.add(value)
			if (unique.size > primaryOption) {
				violations.push({ node, word })
			}
		}

		root.walkRules((rule) => {
			if (is_keyframe_rule(rule) || !rule.selector.trim()) {
				return
			}

			walk(parse_selector_list(rule.selector), (node) => {
				if (!is_pseudo_class_selector(node)) {
					return
				}
				const name = node.name.toLowerCase()
				if (LEGACY_PSEUDO_ELEMENTS.has(name)) {
					return
				}
				add(`:${name}`, rule, `:${node.name}`)
			})
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

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

const plugin: stylelint.Plugin = createPlugin(rule_name, ruleFunction)

export default plugin
