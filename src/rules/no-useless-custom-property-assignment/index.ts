import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { DECLARATION, FUNCTION, IDENTIFIER } from '@projectwallace/css-parser/nodes'
import { walk } from '@projectwallace/css-parser/walker'
import { parse } from '@projectwallace/css-parser/parse'

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

		const css = root.toString()
		const parsed = parse(css, { parse_values: true })
		const line_offset = (root.source?.start?.line ?? 1) - 1

		walk(parsed, (node) => {
			if (node.type !== DECLARATION) return

			const prop = node.property
			if (!prop?.startsWith('--')) return

			if (secondaryOptions?.allowList) {
				const allowed = secondaryOptions.allowList.some(
					(pattern) =>
						(typeof pattern === 'string' && pattern === prop) ||
						(pattern instanceof RegExp && pattern.test(prop)),
				)
				if (allowed) return
			}

			let reported = false

			walk(node, (child) => {
				if (reported) return
				if (child.type !== FUNCTION || child.name !== 'var') return

				for (const grandchild of child.children) {
					if (grandchild.type === IDENTIFIER && grandchild.text === prop) {
						utils.report({
							result,
							ruleName: rule_name,
							message: messages.rejected(prop),
							node: root,
							start: { line: node.line + line_offset, column: node.column },
							end: { line: node.line + line_offset, column: node.column + prop.length },
							word: prop,
						})
						reported = true
						return
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
