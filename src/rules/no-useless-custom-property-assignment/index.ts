import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_declaration, walk, FUNCTION, IDENTIFIER } from '@projectwallace/css-parser'
import type { CSSNode } from '@projectwallace/css-parser'

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
	allowList?: Array<string | RegExp>
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

		root.walkDecls(function (declaration) {
			if (!declaration.variable) return

			const prop = declaration.prop

			if (secondaryOptions?.allowList) {
				const allowed = secondaryOptions.allowList.some(
					(pattern) =>
						(typeof pattern === 'string' && pattern === prop) ||
						(pattern instanceof RegExp && pattern.test(prop)),
				)
				if (allowed) return
			}

			const decl_source = root.source!.input.css.substring(
				declaration.source!.start!.offset,
				declaration.source!.end!.offset,
			)
			const parsed = parse_declaration(decl_source)
			let reported = false

			walk(parsed, (node: CSSNode) => {
				if (reported) return
				if (node.type !== FUNCTION || node.name !== 'var') return

				for (const child of node.children) {
					if (child.type === IDENTIFIER && child.text === prop) {
						utils.report({
							result,
							ruleName: rule_name,
							message: messages.rejected(prop),
							node: declaration,
							word: prop,
						})
						reported = true
						return
					}
					if (child.type === IDENTIFIER && child.text.startsWith('--')) {
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
