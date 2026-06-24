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
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique gradients but found ${actual}`,
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
		const violating_declarations: Array<{ declaration: Declaration; start: number; end: number }> =
			[]

		root.walkDecls(/^(?:background(?:-image))$/, (declaration) => {
			const before = unique_gradients.size
			const ast = parse_value(declaration.value)
			let trigger_start = 0
			let trigger_end = declaration.value.length

			walk(ast, (node) => {
				if (is_function(node)) {
					if (/^(repeating-)?(linear|conic|radial)-gradient$/.test(node.name)) {
						const gradient = node.text
						if (!is_allowed(gradient, ignore)) {
							const is_new = !unique_gradients.has(gradient)
							unique_gradients.add(gradient)
							if (is_new && unique_gradients.size > primaryOption) {
								trigger_start = node.start
								trigger_end = node.end
							}
						}
					}
				}
			})

			if (unique_gradients.size > before && unique_gradients.size > primaryOption) {
				violating_declarations.push({ declaration, start: trigger_start, end: trigger_end })
			}
		})

		const actual = unique_gradients.size
		for (const { declaration, start, end } of violating_declarations) {
			const value_offset = declaration.prop.length + (declaration.raws.between ?? ': ').length
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node: declaration,
				index: value_offset + start,
				endIndex: value_offset + end,
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
