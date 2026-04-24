import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { isAllowed, ignoreOptionValidators } from '../../utils/allow-list.js'
import { analyzeAnimation } from '@projectwallace/css-analyzer/values'
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
				possible: [Number as unknown as (v: unknown) => boolean],
			},
			{
				actual: secondaryOptions,
				possible: {
					ignore: ignoreOptionValidators,
				},
				optional: true,
			},
		)

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 0) {
			return
		}

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

						if (!isAllowed(duration, ignore)) {
							unique_durations.add(duration)
						}
					}
				}
			} else {
				analyzeAnimation(parsed, function (item) {
					if (item.type === 'duration') {
						let duration = item.value.text
						if (!isAllowed(duration, ignore)) {
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
