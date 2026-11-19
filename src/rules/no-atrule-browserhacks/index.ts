import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	get_supports_browserhacks,
	get_media_browserhacks,
} from '@projectwallace/css-analyzer/atrules'
import { parse_prelude_of } from '../../utils/parse.js'
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

			const prelude = parse_prelude_of(at_rule)
			if (!prelude) {
				return
			}

			const hacks =
				name === 'media' ? get_media_browserhacks(prelude) : get_supports_browserhacks(prelude)

			for (const hack of hacks) {
				utils.report({
					message: messages.rejected(hack.value),
					node: at_rule,
					word: hack.value,
					result,
					ruleName: rule_name,
				})
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
