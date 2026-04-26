import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { walk, NUMBER } from '@projectwallace/css-parser'
import { isAllowed, ignoreOptionValidators } from '../../utils/allow-list.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-z-indexes'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, zindexes: string[]) =>
		`Found ${actual} unique z-indexes (${zindexes.join(', ')}) which exceeds the maximum of ${expected}`,
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
				possible: [(v: unknown) => typeof v === 'number'],
			},
			{
				actual: secondaryOptions,
				possible: {
					ignore: ignoreOptionValidators,
				},
				optional: true,
			},
		)

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption < 0) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []
		const unique_zindexes = new Set<string>()
		const violating_declarations: Declaration[] = []

		root.walkDecls(/^z-index$/i, (declaration) => {
			const before = unique_zindexes.size
			const parsed = parse_value(declaration.value)

			walk(parsed, (node) => {
				if (node.type !== NUMBER) return
				const text = node.text
				if (!isAllowed(text, ignore)) {
					unique_zindexes.add(text)
				}
			})

			if (unique_zindexes.size > before && unique_zindexes.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		const actual = unique_zindexes.size
		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_zindexes]),
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
