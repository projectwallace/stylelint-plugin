import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { destructureFontShorthand } from '@projectwallace/css-analyzer/values'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-font-families'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, families: string[]) =>
		`Found ${actual} unique font families (${families.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-font-families/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [Number as unknown as (v: unknown) => boolean],
		})

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 0) {
			return
		}

		const unique_families = new Set<string>()

		root.walkDecls('font-family', (declaration) => {
			unique_families.add(declaration.value)
		})

		root.walkDecls('font', (declaration) => {
			const parsed = parse_value(declaration.value)
			const destructured = destructureFontShorthand(parsed, () => {})
			if (destructured?.font_family) {
				unique_families.add(destructured.font_family)
			}
		})

		const actual = unique_families.size

		if (actual > primaryOption) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_families]),
				node: root,
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
