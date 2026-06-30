import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { IDENTIFIER, OPERATOR } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { keywords } from '@projectwallace/css-analyzer/values'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-container-names'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate container name "${name}"`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-duplicate-container-names/README.md',
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

		const seen = new Map<string, true>()

		root.walkDecls(/^container(-name)?$/i, (decl) => {
			if (keywords.has(decl.value.trim().toLowerCase())) return
			const ast = parse_value(decl.value)
			for (const node of ast) {
				// The `/` in `container: name / type` is an OPERATOR — stop there
				if (node.type === OPERATOR) break
				if (node.type !== IDENTIFIER) continue

				const { text: name } = node
				if (keywords.has(name.toLowerCase())) continue

				if (seen.has(name)) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(name),
						node: decl,
						word: name,
					})
				} else {
					seen.set(name, true)
				}
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
