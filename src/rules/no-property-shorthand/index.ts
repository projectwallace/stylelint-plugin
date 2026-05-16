import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_value } from '@projectwallace/css-parser'
import { shorthand_properties } from '@projectwallace/css-analyzer/properties'
import { is_allowed, ignore_option_validators } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

export const rule_name = 'projectwallace/no-property-shorthand'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `Shorthand property "${property}" is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-property-shorthand/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const not_custom_property = /^(?!--)/

function is_single_value(value: string): boolean {
	return parse_value(value).child_count === 1
}

const ruleFunction = (primaryOption: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(
			result,
			rule_name,
			{ actual: primaryOption, possible: [true] },
			{
				actual: secondaryOptions,
				possible: { ignore: [...ignore_option_validators, (v: unknown) => v === 'single-value'] },
				optional: true,
			},
		)

		if (!validOptions) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []
		const ignore_single_value = ignore.includes('single-value')
		const property_ignore = ignore.filter((x) => x !== 'single-value')

		root.walkDecls(not_custom_property, (declaration) => {
			const property = declaration.prop.toLowerCase()

			if (!shorthand_properties.has(property)) {
				// Not a shorthand property
				return
			}

			if (ignore_single_value && is_single_value(declaration.value)) {
				// Single value and allowed to ignore
				return
			}

			if (property_ignore.length > 0 && is_allowed(property, property_ignore)) {
				// This property is ignored
				return
			}

			utils.report({
				message: messages.rejected(declaration.prop),
				node: declaration,
				result,
				ruleName: rule_name,
				word: declaration.prop,
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
