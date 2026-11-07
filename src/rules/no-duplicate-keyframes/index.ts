import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { keywords } from '@projectwallace/css-analyzer/values'
import { define_rule } from '../../utils/define-rule.js'
import { get_params_offset } from '../../utils/offsets.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-keyframes'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate @keyframes name "${name}"`,
})

const ruleFunction = (primaryOptions: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const valid_options = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!valid_options) {
			return
		}

		const seen = new Set<string>()

		root.walkAtRules(/^keyframes$/i, (at_rule) => {
			const name = at_rule.params.trim()
			if (!name || keywords.has(name)) {
				return
			}

			if (seen.has(name)) {
				const params_offset = get_params_offset(at_rule)
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(name),
					node: at_rule,
					index: params_offset + at_rule.params.indexOf(name),
					endIndex: params_offset + at_rule.params.indexOf(name) + name.length,
				})
			} else {
				seen.add(name)
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
