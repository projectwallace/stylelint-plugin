import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { URL as CSS_URL } from '@projectwallace/css-parser/nodes'
import { walk } from '@projectwallace/css-parser/walker'
import { parse } from '@projectwallace/css-parser/parse'

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

		const css = root.toString()
		const parsed = parse(css, {
			parse_selectors: false,
			parse_atrule_preludes: false,
		})
		const line_offset = (root.source?.start?.line ?? 1) - 1

		const seen = new Set<string>()

		walk(parsed, (node) => {
			if (node.type !== CSS_URL) return
			if (!node.text.includes('data:')) return

			const url = node.text

			if (seen.has(url)) {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(),
					node: root,
					start: { line: node.line + line_offset, column: node.column },
					end: { line: node.line + line_offset, column: node.column + url.length },
					word: url,
				})
			} else {
				seen.add(url)
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
