import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { walk, BREAK, parse_value } from '@projectwallace/css-parser'
import { is_allowed, ignore_option_validators } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint
const rule_name = 'projectwallace/no-prefixed-values'

const messages = utils.ruleMessages(rule_name, {
	rejected: (value: string) => `Value "${value}" is vendor-prefixed and is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-prefixed-values/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const ruleFunction = (primaryOption: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(
			result,
			rule_name,
			{ actual: primaryOption, possible: [true] },
			{
				actual: secondaryOptions,
				possible: { ignore: ignore_option_validators },
				optional: true,
			},
		)

		if (!validOptions) return

		const ignore = secondaryOptions?.ignore ?? []

		root.walkDecls((declaration) => {
			const value = parse_value(declaration.value.trim())

			walk(value, (node) => {
				if (node.is_vendor_prefixed && !is_allowed(node.text, ignore)) {
					utils.report({
						message: messages.rejected(node.text),
						node: declaration,
						result,
						ruleName: rule_name,
					})
					return BREAK
				}
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
