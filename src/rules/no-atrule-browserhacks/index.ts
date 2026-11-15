import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	get_supports_browserhacks,
	get_media_browserhacks,
} from '@projectwallace/css-analyzer/atrules'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint
const rule_name = 'projectwallace/no-atrule-browserhacks'

const messages = utils.ruleMessages(rule_name, {
	rejected: (hack: string) => `Unexpected browserhack in at-rule prelude "${hack}"`,
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

		root.walkAtRules((at_rule) => {
			const name = at_rule.name.toLowerCase()
			if (name !== 'media' && name !== 'supports') {
				return
			}

			const hacks =
				name === 'media'
					? get_media_browserhacks(at_rule.params)
					: get_supports_browserhacks(at_rule.params)

			for (const hack of hacks) {
				utils.report({
					message: messages.rejected(hack),
					node: at_rule,
					word: hack,
					result,
					ruleName: rule_name,
				})
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
