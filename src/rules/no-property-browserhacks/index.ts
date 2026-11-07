import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-property-browserhacks'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `Unexpected browserhack property "${property}"`,
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
			// Browserhack chars like * end up in raws.before since they're not valid identifier starts
			if (/\S/.test(declaration.raws.before ?? '')) {
				const property = (declaration.raws.before + declaration.prop).trim()
				utils.report({
					message: messages.rejected(property),
					node: declaration,
					word: declaration.prop,
					result,
					ruleName: rule_name,
				})
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
