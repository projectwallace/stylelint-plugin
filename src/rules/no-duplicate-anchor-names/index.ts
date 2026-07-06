import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { IDENTIFIER } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { keywords } from '@projectwallace/css-analyzer/values'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-anchor-names'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate anchor name "${name}"`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-duplicate-anchor-names/README.md',
}

const ruleFunction = (primaryOptions: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const valid_options = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!valid_options) {
			return
		}

		const seen = new Set<string>()

		root.walkDecls(/^anchor-name$/i, (declaration) => {
			if (keywords.has(declaration.value.trim())) {
				return
			}
			const ast = parse_value(declaration.value)
			const value_offset = declaration.prop.length + (declaration.raws.between ?? ': ').length
			for (const node of ast) {
				// anchor-name values are comma-separated dashed-idents; commas are
				// OPERATOR nodes — skip them and keep iterating
				if (node.type !== IDENTIFIER) continue

				const { text: name } = node
				if (keywords.has(name)) continue

				if (seen.has(name)) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(name),
						node: declaration,
						index: value_offset + node.start,
						endIndex: value_offset + node.end,
					})
				} else {
					seen.add(name)
				}
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
