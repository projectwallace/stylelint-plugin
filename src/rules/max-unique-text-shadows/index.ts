import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { keywords } from '@projectwallace/css-analyzer/values'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_positive_integer,
} from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-text-shadows'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, shadows: string[]) =>
		`Found ${actual} unique text shadows (${shadows.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-text-shadows/README.md',
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
		const unique_shadows = new Set<string>()
		const violating_declarations: Declaration[] = []

		root.walkDecls('text-shadow', (declaration) => {
			const before = unique_shadows.size
			const value = declaration.value

			if (!keywords.has(value) && !is_allowed(value, ignore)) {
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
