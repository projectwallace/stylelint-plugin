import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { define_rule } from '../../utils/define-rule.js'
import { walk_custom_decls } from '../../utils/walk.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-custom-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate custom property "${name}"`,
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

		walk_custom_decls(root, (declaration) => {
			const name = declaration.prop

			if (seen.has(name)) {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(name),
					node: declaration,
					index: 0,
					endIndex: name.length,
				})
			} else {
				seen.add(name)
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
