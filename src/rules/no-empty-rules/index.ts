import stylelint from 'stylelint'
import type { Root, Rule, AtRule } from 'postcss'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-empty-rules'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Empty rules are not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-empty-rules/README.md',
}

interface SecondaryOptions {
	allow?: Array<'rules' | 'atrules' | 'comments'>
}

function has_only_comments(node: Rule | AtRule): boolean {
	if (!node.nodes || node.nodes.length === 0) return true
	return node.nodes.every((child) => child.type === 'comment')
}

const ruleFunction = (primaryOptions: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(
			result,
			rule_name,
			{
				actual: primaryOptions,
				possible: [true],
			},
			{
				actual: secondaryOptions,
				possible: {
					allow: ['rules', 'atrules', 'comments'],
				},
				optional: true,
			},
		)

		if (!validOptions) {
			return
		}

		const allow = secondaryOptions?.allow ?? []
		const allow_comments = allow.includes('comments')

		function is_empty(node: Rule | AtRule): boolean {
			if (!node.nodes || node.nodes.length === 0) return true
			if (allow_comments && has_only_comments(node)) return false
			return has_only_comments(node)
		}

		if (!allow.includes('rules')) {
			root.walkRules((rule) => {
				if (is_empty(rule)) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(),
						node: rule,
					})
				}
			})
		}

		if (!allow.includes('atrules')) {
			root.walkAtRules((at_rule) => {
				if (at_rule.nodes === undefined) return
				if (is_empty(at_rule)) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(),
						node: at_rule,
					})
				}
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
