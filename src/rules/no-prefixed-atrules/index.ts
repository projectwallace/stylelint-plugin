import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_allowed, ignore_option_validators } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint
const rule_name = 'projectwallace/no-prefixed-atrules'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `At-rule "@${name}" is vendor-prefixed and is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-prefixed-atrules/README.md',
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

		root.walkAtRules((at_rule) => {
			const name = at_rule.name
			if (name.startsWith('-') && name.indexOf('-', 2) !== -1 && !is_allowed(name, ignore)) {
				utils.report({
					message: messages.rejected(name),
					node: at_rule,
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
