import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_positive_integer,
} from '../../utils/option-validators.js'
import { analyzeAnimation, keywords } from '@projectwallace/css-analyzer/values'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { OPERATOR } from '@projectwallace/css-parser'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-durations'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number, shadows: string[]) =>
		`Found ${actual} unique durations (${shadows.join(', ')}) which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-durations/README.md',
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
		const unique_durations = new Set<string>()
		const violating_declarations: Declaration[] = []

		root.walkDecls(/^(animation|transition)(-duration)?$/, (declaration) => {
			let parsed = parse_value(declaration.value)
			const before = unique_durations.size

			if (declaration.prop === 'animation-duration' || declaration.prop === 'transition-duration') {
				for (let child of parsed.children) {
					if (child.type !== OPERATOR) {
						let duration = child.text

						if (!keywords.has(duration) && !is_allowed(duration, ignore)) {
							unique_durations.add(duration)
						}
					}
				}
			} else {
				analyzeAnimation(parsed, function (item) {
					if (item.type === 'duration') {
						let duration = item.value.text
						if (!is_allowed(duration, ignore)) {
							unique_durations.add(duration)
						}
					}
				})
			}

			if (unique_durations.size > before && unique_durations.size > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		const actual = unique_durations.size
		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(actual, primaryOption, [...unique_durations]),
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
