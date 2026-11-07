import stylelint from 'stylelint'
import type { Root, Declaration, AtRule } from 'postcss'
import { is_custom, str_equals } from '@projectwallace/css-parser'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_non_negative_integer,
} from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-custom-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique custom properties but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-custom-properties/README.md',
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

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

const plugin: stylelint.Plugin = createPlugin(rule_name, ruleFunction)

export default plugin
