import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_var_references } from '@projectwallace/css-analyzer/values'
import { is_allowed } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-useless-custom-property-assignment'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `Unexpected useless custom property assignment for "${property}"`,
})

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const ruleFunction = (primaryOptions: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		root.walkDecls(/^--/, (decl) => {
			const property = decl.prop

			if (secondaryOptions?.ignore && is_allowed(property, secondaryOptions.ignore)) {
				return
			}

			if (get_var_references(decl.value).some((reference) => reference.value === property)) {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(property),
					node: decl,
					word: property,
				})
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
