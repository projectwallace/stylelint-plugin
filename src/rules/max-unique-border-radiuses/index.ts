import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { keywords } from '@projectwallace/css-analyzer/values'
import { parse_value } from '@projectwallace/css-parser'
import {
	is_allowed,
	is_valid_positive_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { walk_decls } from '../../utils/walk.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-border-radiuses'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique border radiuses but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-border-radiuses/README.md',
}

/**
 * Normalizes the whitespace of a border-radius value so that equivalent notations
 * are counted once: `2px  4px` becomes `2px 4px` and `4px/3px` becomes `4px / 3px`.
 */
function normalize(value: string): string {
	return [...parse_value(value).children].map((node) => node.text).join(' ')
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
			[is_valid_positive_integer],
		)

		if (!validOptions) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []
		const unique = new Set<string>()
		const violations: Array<{ node: Declaration; word: string }> = []

		function add(value: string, node: Declaration, word: string) {
			if (unique.has(value) || is_allowed(value, ignore)) {
				return
			}
			unique.add(value)
			if (unique.size > primaryOption) {
				violations.push({ node, word })
			}
		}

		walk_decls(
			root,
			[
				'border-radius',
				'border-top-left-radius',
				'border-top-right-radius',
				'border-bottom-left-radius',
				'border-bottom-right-radius',
				'border-start-start-radius',
				'border-start-end-radius',
				'border-end-start-radius',
				'border-end-end-radius',
			],
			(declaration) => {
				const raw = declaration.value
				if (keywords.has(raw) || is_allowed(raw, ignore)) {
					return
				}
				add(normalize(raw), declaration, raw)
			},
		)

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
