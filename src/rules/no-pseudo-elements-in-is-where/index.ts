import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_pseudo_elements_in_is_where } from '@projectwallace/css-analyzer/selectors'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint
const rule_name = 'projectwallace/no-pseudo-elements-in-is-where'

const messages = utils.ruleMessages(rule_name, {
	rejected: (pseudo_element: string, pseudo_function: string) =>
		`Unexpected pseudo-element "${pseudo_element}" inside ":${pseudo_function}()"`,
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

		root.walkRules((rule) => {
			const selector_text = rule.selector
			if (!selector_text.trim()) {
				return
			}

			for (const { value, pseudo_class } of get_pseudo_elements_in_is_where(selector_text)) {
				utils.report({
					message: messages.rejected(value, pseudo_class),
					node: rule,
					result,
					ruleName: rule_name,
					word: value,
				})
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
