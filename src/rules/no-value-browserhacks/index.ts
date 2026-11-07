import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { isValueBrowserhack } from '@projectwallace/css-analyzer/values'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { is_custom } from '@projectwallace/css-parser/string-utils'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint
const rule_name = 'projectwallace/no-value-browserhacks'

const messages = utils.ruleMessages(rule_name, {
	rejected: (value: string) => `Unexpected browserhack value "${value}"`,
})

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		root.walkDecls((declaration) => {
			if (is_custom(declaration.prop)) {
				return
			}
			const value = declaration.value.trim()
			isValueBrowserhack(parse_value(value), function (hack) {
				utils.report({
					message: messages.rejected(hack),
					node: declaration,
					// hacks like `alpha()` are not in the CSS (`alpha(opacity=50)`) so in that case we report the whole value
					word: value.includes(hack) ? hack : value,
					result,
					ruleName: rule_name,
				})
			})
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
