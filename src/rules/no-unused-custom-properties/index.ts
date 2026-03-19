import stylelint from 'stylelint'
import type { Root, Declaration, AtRule } from 'postcss'
import { parse_declaration, walk, FUNCTION, IDENTIFIER } from '@projectwallace/css-parser'
import type { CSSNode } from '@projectwallace/css-parser'

const { createPlugin, utils } = stylelint

const rule_name = 'project-wallace/no-unused-custom-properties'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `"${property}" was declared but never used in a var()`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugins',
}

interface SecondaryOptions {
	ignoreProperties?: Array<string | RegExp>
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

		const declared_properties = new Map<string, Declaration | AtRule>()
		const used_properties = new Set<string>()

		root.walkAtRules('property', function (atRule) {
			const property_name = atRule.params.trim()
			if (property_name.startsWith('--')) {
				declared_properties.set(property_name, atRule)
			}
		})

		root.walkDecls(function (declaration) {
			if (declaration.prop.startsWith('--')) {
				declared_properties.set(declaration.prop, declaration)
			}

			const decl_source = root.source!.input.css.substring(
				declaration.source!.start!.offset,
				declaration.source!.end!.offset,
			)
			const parsed = parse_declaration(decl_source)

			walk(parsed, (node: CSSNode) => {
				if (node.type === FUNCTION && node.name === 'var') {
					for (const child of node.children) {
						if (child.type === IDENTIFIER && child.text.startsWith('--')) {
							used_properties.add(child.text)
							break
						}
					}
				}
			})
		})

		for (const [prop, node] of declared_properties) {
			if (used_properties.has(prop)) continue

			if (secondaryOptions?.ignoreProperties) {
				const ignored = secondaryOptions.ignoreProperties.some(
					(pattern) =>
						(typeof pattern === 'string' && pattern === prop) ||
						(pattern instanceof RegExp && pattern.test(prop)),
				)
				if (ignored) continue
			}

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(prop),
				node,
				word: prop,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
