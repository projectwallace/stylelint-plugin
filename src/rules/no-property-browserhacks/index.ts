import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { DECLARATION } from '@projectwallace/css-parser/nodes'
import { walk } from '@projectwallace/css-parser/walker'
import { parse } from '@projectwallace/css-parser/parse'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-property-browserhacks'

const messages = utils.ruleMessages(rule_name, {
	rejected: (property: string) => `Property "${property}" is a browserhack and is not allowed`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-property-browserhacks/README.md',
}

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		const css = root.toString()
		const parsed = parse(css)
		const line_offset = (root.source?.start?.line ?? 1) - 1

		walk(parsed, (node) => {
			if (node.type !== DECLARATION) return
			if (!node.is_browserhack) return

			const property = node.property!
			utils.report({
				message: messages.rejected(property),
				node: root,
				start: { line: node.line + line_offset, column: node.column },
				end: { line: node.line + line_offset, column: node.column + property.length },
				result,
				ruleName: rule_name,
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
