import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
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

		const declared_properties = new Set<Declaration>()
		const used_properties = new Set<string>()

		root.walkDecls(function (declaration) {
			if (declaration.prop.startsWith('--')) {
				declared_properties.add(declaration)
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

		outer_declared: for (const declaration of declared_properties) {
			for (const used of used_properties) {
				if (used === declaration.prop) {
					continue outer_declared
				}
			}

			if (secondaryOptions?.ignoreProperties) {
				for (const ignored of secondaryOptions.ignoreProperties) {
					if (typeof ignored === 'string' && ignored === declaration.prop) {
						continue outer_declared
					} else if (ignored instanceof RegExp && ignored.test(declaration.prop)) {
						continue outer_declared
					}
				}
			}

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(declaration.prop),
				node: declaration,
				word: declaration.prop,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
