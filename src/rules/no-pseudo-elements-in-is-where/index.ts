import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	walk,
	SKIP,
	parse_selector_list,
	is_pseudo_class_selector,
	is_pseudo_element_selector,
} from '@projectwallace/css-parser'

const { createPlugin, utils } = stylelint
const rule_name = 'projectwallace/no-pseudo-elements-in-is-where'

const messages = utils.ruleMessages(rule_name, {
	rejected: (pseudo_element: string, pseudo_function: string) =>
		`Unexpected pseudo-element "${pseudo_element}" inside ":${pseudo_function}()"`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-pseudo-elements-in-is-where/README.md',
}

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) return

		root.walkRules((rule) => {
			const selector_text = rule.selector
			if (!selector_text.trim()) return

			const selector_list = parse_selector_list(selector_text)

			walk(selector_list, (node) => {
				if (!is_pseudo_class_selector(node)) return

				const name = node.name.toLowerCase()
				if (name !== 'is' && name !== 'where') return SKIP

				// We're inside :is() or :where() - check for pseudo-elements
				walk(node, (child) => {
					if (child === node) return
					if (is_pseudo_element_selector(child)) {
						utils.report({
							message: messages.rejected(`::${child.name}`, name),
							node: rule,
							result,
							ruleName: rule_name,
							word: `::${child.name}`,
						})
					}
				})

				return SKIP
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
