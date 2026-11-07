import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { URL as CSS_URL } from '@projectwallace/css-parser/nodes'
import { walk } from '@projectwallace/css-parser/walker'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { str_index_of } from '@projectwallace/css-parser/string-utils'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-data-urls'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Unexpected duplicate data URL`,
})

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
				if (node.type !== CSS_URL) {
					return
				}
				const { text: url } = node
				if (str_index_of('data:', url) === -1) {
					return
				}

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

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
