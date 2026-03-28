import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { URL as CSS_URL } from '@projectwallace/css-parser/nodes'
import { walk } from '@projectwallace/css-parser/walker'
import { parse_value } from '@projectwallace/css-parser/parse-value'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-data-urls'

const messages = utils.ruleMessages(rule_name, {
	rejected: () =>
		`Duplicate data URL found. Store it in a custom property and use var() to reuse it.`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-duplicate-data-urls/README.md',
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

		const seen = new Set<string>()

		root.walkDecls((declaration) => {
			const parsed = parse_value(declaration.value)

			walk(parsed, (node) => {
				if (node.type !== CSS_URL) return
				const { text: url } = node
				if (!url.includes('data:')) return

				if (seen.has(url)) {
					utils.report({
						result,
						ruleName: rule_name,
						message: messages.rejected(),
						node: declaration,
						word: url,
					})
				} else {
					seen.add(url)
				}
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
