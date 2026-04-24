import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { isAllowed } from '../../utils/allow-list.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-box-shadows'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, shadows: string[]) =>
		`Found ${actual} unique box shadows (${shadows.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-box-shadows/README.md',
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
				possible: [Number as unknown as (v: unknown) => boolean],
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

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 0) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []
		const unique_shadows = new Set<string>()
		const violating_declarations: Declaration[] = []

		root.walkDecls('box-shadow', (declaration) => {
			const before = unique_shadows.size
			const value = declaration.value

			if (!isAllowed(value, ignore)) {
				unique_shadows.add(value)
			}

			if (unique_shadows.size > before && unique_shadows.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		const actual = unique_shadows.size
		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_shadows]),
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
