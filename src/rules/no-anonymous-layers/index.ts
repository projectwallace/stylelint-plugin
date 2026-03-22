import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { AT_RULE, LAYER_NAME } from '@projectwallace/css-parser/nodes'
import { walk } from '@projectwallace/css-parser/walker'
import { parse } from '@projectwallace/css-parser/parse'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-anonymous-layers'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Anonymous @layer is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-anonymous-layers/README.md',
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
			parse_selectors: false,
			parse_values: false,
		})
		const line_offset = (root.source?.start?.line ?? 1) - 1

		walk(parsed, (node) => {
			if (node.type !== AT_RULE) return

			if (node.name === 'layer') {
				// Anonymous layer: has a block but no name (empty/missing prelude)
				if (node.has_block && !node.prelude?.text.trim()) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(),
						node: root,
						start: { line: node.line + line_offset, column: node.column },
						end: {
							line: node.line + line_offset,
							column: node.column + '@layer'.length,
						},
					})
				}
			} else if (node.name === 'import') {
				// Check @import for anonymous layer syntax
				const prelude = node.prelude
				if (!prelude) return

				walk(prelude, (child) => {
					if (child.type === LAYER_NAME && !child.name) {
						utils.report({
							result,
							ruleName: rule_name,
							message: messages.rejected(),
							node: root,
							start: { line: node.line + line_offset, column: node.column },
							end: {
								line: node.line + line_offset,
								column: node.column + '@import'.length,
							},
						})
					}
				})
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
