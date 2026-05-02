import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { isSupportsBrowserhack, isMediaBrowserhack } from '@projectwallace/css-analyzer/atrules'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'

const { createPlugin, utils } = stylelint
const rule_name = 'projectwallace/no-atrule-browserhacks'

const messages = utils.ruleMessages(rule_name, {
	rejected: (hack: string) => `At-rule prelude contains a browserhack "${hack}" and is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-atrule-browserhacks/README.md',
}

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) return

		root.walkAtRules((at_rule) => {
			const name = at_rule.name.toLowerCase()
			if (name !== 'media' && name !== 'supports') return

			const nodes = parse_atrule_prelude(name, at_rule.params)

			for (const node of nodes) {
				if (name === 'media') {
					isMediaBrowserhack(node, (hack) => {
						utils.report({
							message: messages.rejected(hack),
							node: at_rule,
							result,
							ruleName: rule_name,
						})
					})
				} else {
					isSupportsBrowserhack(node, (hack) => {
						utils.report({
							message: messages.rejected(hack),
							node: at_rule,
							result,
							ruleName: rule_name,
						})
					})
				}
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
