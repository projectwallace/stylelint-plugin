import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { isIe9Hack } from '@projectwallace/css-analyzer/values'
import { parse_value } from '@projectwallace/css-parser/parse-value'

const { createPlugin, utils } = stylelint
const rule_name = 'projectwallace/no-value-browserhacks'

const messages = utils.ruleMessages(rule_name, {
	rejected: (value: string) => `Value "${value}" is a browserhack and is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-value-browserhacks/README.md',
}

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) return

		root.walkDecls((declaration) => {
			if (declaration.prop.startsWith('--')) {
				return
			}
			const value = declaration.value.trim()
			if (isIe9Hack(parse_value(value))) {
				utils.report({
					message: messages.rejected(value),
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
