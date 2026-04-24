import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { isAllowed } from '../../utils/allow-list.js'
import { FUNCTION, IDENTIFIER } from '@projectwallace/css-parser/nodes'
import { BREAK, walk } from '@projectwallace/css-parser/walker'
import { parse_value } from '@projectwallace/css-parser/parse-value'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-useless-custom-property-assignment'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) =>
		`"${property}" is assigned to itself via var(), which has no effect`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-useless-custom-property-assignment/README.md',
}

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

			if (secondaryOptions?.ignore && isAllowed(property, secondaryOptions.ignore)) return

			const parsed = parse_value(decl.value)

			let reported = false

			walk(parsed, (child) => {
				if (reported) return BREAK
				if (child.type !== FUNCTION || child.name !== 'var') return

				for (const grandchild of child.children) {
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
					if (grandchild.type === IDENTIFIER && grandchild.text.startsWith('--')) {
						break
					}
				}
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
