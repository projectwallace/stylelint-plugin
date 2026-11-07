import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk } from '@projectwallace/css-parser/walker'
import {
	is_allowed,
	is_valid_positive_integer,
	validate_options_with_ignore,
} from '../../utils/option-validators.js'
import { is_function } from '@projectwallace/css-parser'
import { str_equals, str_starts_with } from '@projectwallace/css-parser/string-utils'
import { UniqueTracker } from '../../utils/unique-tracker.js'

function is_gradient_name(name: string): boolean {
	const base = str_starts_with('repeating-', name) ? name.slice('repeating-'.length) : name
	return (
		str_equals('linear-gradient', base) ||
		str_equals('conic-gradient', base) ||
		str_equals('radial-gradient', base)
	)
}

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

		const unique_gradients = new UniqueTracker(primaryOption)
		const violating_declarations: Array<{ declaration: Declaration; start: number; end: number }> =
			[]

		root.walkDecls(/^background(-image)?$/i, (declaration) => {
			unique_gradients.begin()
			const ast = parse_value(declaration.value)
			let trigger_start = 0
			let trigger_end = declaration.value.length

			walk(ast, (node) => {
				if (is_function(node)) {
					if (is_gradient_name(node.name)) {
						const gradient = node.text
						if (!is_allowed(gradient, ignore)) {
							if (unique_gradients.add(gradient)) {
								trigger_start = node.start
								trigger_end = node.end
							}
						}
					}
				}
			})

			if (unique_gradients.exceeded()) {
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

const plugin: stylelint.Plugin = createPlugin(rule_name, ruleFunction)

export default plugin
