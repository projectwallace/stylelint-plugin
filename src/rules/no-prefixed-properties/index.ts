import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { basename } from '@projectwallace/css-analyzer/properties'
import { is_allowed, ignore_option_validators } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint
const rule_name = 'projectwallace/no-prefixed-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `Property "${property}" is vendor-prefixed and is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-prefixed-properties/README.md',
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
			const prop = declaration.prop
			if (basename(prop) !== prop && !is_allowed(prop, ignore)) {
				utils.report({
					message: messages.rejected(prop),
					node: declaration,
					result,
					ruleName: rule_name,
				})
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
