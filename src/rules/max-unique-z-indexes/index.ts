import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk, NUMBER } from '@projectwallace/css-parser'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_non_negative_integer,
} from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-z-indexes'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique z-indexes but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-z-indexes/README.md',
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

		if (!validOptions) return

		const ignore = secondaryOptions?.ignore ?? []
		const unique_zindexes = new Set<string>()
		const violating_declarations: Array<{ declaration: Declaration; start: number; end: number }> =
			[]

		root.walkDecls(/^z-index$/i, (declaration) => {
			const before = unique_zindexes.size
			const parsed = parse_value(declaration.value)
			let trigger_start = 0
			let trigger_end = declaration.value.length

			walk(parsed, (node) => {
				if (node.type !== NUMBER) return
				const text = node.text
				if (!is_allowed(text, ignore)) {
					const is_new = !unique_zindexes.has(text)
					unique_zindexes.add(text)
					if (is_new && unique_zindexes.size > primaryOption) {
						trigger_start = node.start
						trigger_end = node.end
					}
				}
			})

			if (unique_zindexes.size > before && unique_zindexes.size > primaryOption) {
				violating_declarations.push({ declaration, start: trigger_start, end: trigger_end })
			}
		})

		const actual = unique_zindexes.size
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
