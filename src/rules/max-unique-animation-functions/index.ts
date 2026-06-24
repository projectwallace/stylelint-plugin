import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_positive_integer,
} from '../../utils/option-validators.js'
import { analyzeAnimation } from '@projectwallace/css-analyzer/values'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { OPERATOR } from '@projectwallace/css-parser'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-animation-functions'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique animation-functions but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-animation-functions/README.md',
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
				possible: [is_valid_positive_integer],
			},
			{
				actual: secondaryOptions,
				possible: {
					ignore: ignore_option_validators,
				},
				optional: true,
			},
		)

		if (!validOptions) return

		const ignore = secondaryOptions?.ignore ?? []
		const unique_functions = new Set<string>()
		const violating_declarations: Array<{ declaration: Declaration; word: string }> = []

		root.walkDecls(/^(animation|transition)(-timing-function)?$/, (declaration) => {
			let parsed = parse_value(declaration.value)
			const before = unique_functions.size
			let triggering_fn = declaration.value

			if (
				declaration.prop === 'animation-timing-function' ||
				declaration.prop === 'transition-timing-function'
			) {
				for (let child of parsed) {
					if (child.type !== OPERATOR) {
						let fn = child.text
						if (!is_allowed(fn, ignore)) {
							const is_new = !unique_functions.has(fn)
							unique_functions.add(fn)
							if (is_new && unique_functions.size > primaryOption) {
								triggering_fn = fn
							}
						}
					}
				}
			} else {
				analyzeAnimation(parsed, function (item) {
					if (item.type === 'fn') {
						let fn = item.value.text
						if (!is_allowed(fn, ignore)) {
							const is_new = !unique_functions.has(fn)
							unique_functions.add(fn)
							if (is_new && unique_functions.size > primaryOption) {
								triggering_fn = fn
							}
						}
					}
				})
			}

			if (unique_functions.size > before && unique_functions.size > primaryOption) {
				violating_declarations.push({ declaration, word: triggering_fn })
			}
		})

		const actual = unique_functions.size
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

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
