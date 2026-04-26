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
	rejected: (actual: number, expected: number, shadows: string[]) =>
		`Found ${actual} unique animation-functions (${shadows.join(', ')}) which exceeds the maximum of ${expected}`,
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
		const violating_declarations: Declaration[] = []

		root.walkDecls(/^(animation|transition)(-timing-function)?$/, (declaration) => {
			let parsed = parse_value(declaration.value)
			const before = unique_functions.size

			if (
				declaration.prop === 'animation-timing-function' ||
				declaration.prop === 'transition-timing-function'
			) {
				for (let child of parsed.children) {
					if (child.type !== OPERATOR) {
						let fn = child.text
						if (!is_allowed(fn, ignore)) {
							unique_functions.add(fn)
						}
					}
				}
			} else {
				analyzeAnimation(parsed, function (item) {
					if (item.type === 'fn') {
						let fn = item.value.text
						if (!is_allowed(fn, ignore)) {
							unique_functions.add(item.value.text)
						}
					}
				})
			}

			if (unique_functions.size > before && unique_functions.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		const actual = unique_functions.size
		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_functions]),
				node: declaration,
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
