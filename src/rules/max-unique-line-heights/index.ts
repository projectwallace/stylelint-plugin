import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { destructureFontShorthand } from '@projectwallace/css-analyzer/values'
import { isAllowed, ignoreOptionValidators } from '../../utils/allow-list.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-line-heights'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, heights: string[]) =>
		`Found ${actual} unique line heights (${heights.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-line-heights/README.md',
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
		const unique_heights = new Set<string>()
		const violating_declarations: Declaration[] = []

		root.walkDecls('line-height', (declaration) => {
			const before = unique_heights.size
			if (!isAllowed(declaration.value, ignore)) {
				unique_heights.add(declaration.value)
			}
			if (unique_heights.size > before && unique_heights.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		root.walkDecls('font', (declaration) => {
			const before = unique_heights.size
			const parsed = parse_value(declaration.value)
			const destructured = destructureFontShorthand(parsed, () => {})
			if (destructured?.line_height && !isAllowed(destructured.line_height, ignore)) {
				unique_heights.add(destructured.line_height)
			}
			if (unique_heights.size > before && unique_heights.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		const actual = unique_heights.size
		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_heights]),
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
