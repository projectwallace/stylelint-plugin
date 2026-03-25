import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { DECLARATION, NUMBER } from '@projectwallace/css-parser/nodes'
import { walk } from '@projectwallace/css-parser/walker'
import { parse } from '@projectwallace/css-parser/parse'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-invalid-z-index'

const INT32_MIN = -2147483648
const INT32_MAX = 2147483647

const messages = utils.ruleMessages(rule_name, {
	rejected: (value: number) => `z-index value "${value}" is not a valid 32-bit integer`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-invalid-z-index/README.md',
}

const ruleFunction = (primaryOptions: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		const css = root.toString()
		const parsed = parse(css, {
			parse_atrule_preludes: false,
			parse_selectors: false,
		})
		const line_offset = (root.source?.start?.line ?? 1) - 1

		walk(parsed, (node) => {
			if (node.type !== DECLARATION) return
			if (node.property?.toLowerCase() !== 'z-index') return

			walk(node, (child) => {
				if (child.type !== NUMBER) return

				const num = child.value_as_number
				if (num === null) return

				if (!Number.isInteger(num) || num < INT32_MIN || num > INT32_MAX) {
					const word = child.text
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(num),
						node: root,
						start: { line: child.line + line_offset, column: child.column },
						end: {
							line: child.line + line_offset,
							column: child.column + word.length,
						},
						word,
					})
				}
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
