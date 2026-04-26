import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { shorthand_properties } from '@projectwallace/css-analyzer/properties'
import { is_allowed } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-property-shorthand'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `Shorthand property "${property}" is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-property-shorthand/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const ruleFunction = (primaryOption: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		root.walkDecls((declaration) => {
			const property = declaration.prop.toLowerCase()
			if (!shorthand_properties.has(property)) return
			if (secondaryOptions?.ignore && is_allowed(property, secondaryOptions.ignore)) return

			utils.report({
				message: messages.rejected(declaration.prop),
				node: declaration,
				result,
				ruleName: rule_name,
				word: declaration.prop,
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
