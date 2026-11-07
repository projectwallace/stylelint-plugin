import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_allowed } from '../../utils/option-validators.js'
import { FUNCTION, IDENTIFIER } from '@projectwallace/css-parser/nodes'
import { BREAK, walk } from '@projectwallace/css-parser/walker'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { is_custom, str_equals } from '@projectwallace/css-parser/string-utils'
import { define_rule } from '../../utils/define-rule.js'
import { walk_custom_decls } from '../../utils/walk.js'

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

		walk_custom_decls(root, (decl) => {
			const property = decl.prop

			if (secondaryOptions?.ignore && is_allowed(property, secondaryOptions.ignore)) {
				return
			}

			const parsed = parse_value(decl.value)

			let reported = false

			walk(parsed, (child) => {
				if (reported) {
					return BREAK
				}
				if (child.type !== FUNCTION || !str_equals('var', child.name)) {
					return
				}

				for (const grandchild of child) {
					if (grandchild.type === IDENTIFIER && grandchild.text === property) {
						utils.report({
							result,
							ruleName: rule_name,
							message: messages.rejected(property),
							node: decl,
							word: property,
						})
						reported = true
						return BREAK
					}
					if (grandchild.type === IDENTIFIER && is_custom(grandchild.text)) {
						break
					}
				}
			})
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
