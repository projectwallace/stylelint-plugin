import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { destructureFontShorthand } from '@projectwallace/css-analyzer/values'
import { isAllowed } from '../../utils/allow-list.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-font-sizes'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, sizes: string[]) =>
		`Found ${actual} unique font sizes (${sizes.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-font-sizes/README.md',
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
					ignore: [
						String as unknown as (v: unknown) => boolean,
						(v: unknown) => v instanceof RegExp,
					],
				},
				optional: true,
			},
		)

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption < 0) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []
		const unique_sizes = new Set<string>()
		const violating_declarations: Declaration[] = []

		root.walkDecls('font-size', (declaration) => {
			const before = unique_sizes.size
			if (!isAllowed(declaration.value, ignore)) {
				unique_sizes.add(declaration.value)
			}
			if (unique_sizes.size > before && unique_sizes.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		root.walkDecls('font', (declaration) => {
			const before = unique_sizes.size
			const parsed = parse_value(declaration.value)
			const destructured = destructureFontShorthand(parsed, () => {})
			if (destructured?.font_size && !isAllowed(destructured.font_size, ignore)) {
				unique_sizes.add(destructured.font_size)
			}
			if (unique_sizes.size > before && unique_sizes.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		const actual = unique_sizes.size
		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_sizes]),
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
