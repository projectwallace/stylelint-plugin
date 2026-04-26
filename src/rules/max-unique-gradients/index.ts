import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk } from '@projectwallace/css-parser/walker'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_positive_integer,
} from '../../utils/option-validators.js'
import { is_function } from '@projectwallace/css-parser'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-gradients'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, gradients: string[]) =>
		`Found ${actual} unique gradients (${gradients.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-gradients/README.md',
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

		const unique_gradients = new Set<string>()
		const violating_declarations: Declaration[] = []

		root.walkDecls(/^(?:background(?:-image))$/, (declaration) => {
			const before = unique_gradients.size
			const ast = parse_value(declaration.value)
			walk(ast, (node) => {
				if (is_function(node)) {
					if (/^(repeating-)?(linear|conic|radial)-gradient$/.test(node.name)) {
						const gradient = node.text

						if (!is_allowed(gradient, ignore)) {
							unique_gradients.add(gradient)
						}
					}
				}
			})
			if (unique_gradients.size > before && unique_gradients.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		const actual = unique_gradients.size
		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_gradients]),
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
