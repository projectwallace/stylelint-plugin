import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_selector } from '@projectwallace/css-parser/parse-selector'
import { STYLE_RULE } from '@projectwallace/css-parser/nodes'
import { walk } from '@projectwallace/css-parser/walker'
import { parse } from '@projectwallace/css-parser/parse'
import { selectorComplexity } from '@projectwallace/css-analyzer'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-selector-complexity'

const messages = utils.ruleMessages(rule_name, {
	rejected: (selector: string, actual: number, expected: number) =>
		`Selector complexity of "${selector}" is ${actual} which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-selector-complexity/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [Number as unknown as (v: unknown) => boolean],
		})

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 1) {
			return
		}

		const css = root.toString()
		const parsed = parse(css, {
			parse_atrule_preludes: false,
			parse_values: false,
		})
		const line_offset = (root.source?.start?.line ?? 1) - 1

		walk(parsed, (node) => {
			if (node.type !== STYLE_RULE) return

			const selector_text = node.prelude?.text ?? ''
			if (!selector_text.trim()) return

			const selector_list = parse_selector(selector_text)

			for (const selector of selector_list.children) {
				const complexity = selectorComplexity(selector)
				const stringified = selector.text.replace(/\n/g, '')

				if (complexity > primaryOption) {
					utils.report({
						message: messages.rejected(stringified, complexity, primaryOption),
						node: root,
						start: { line: node.line + line_offset, column: node.column },
						end: { line: node.line + line_offset, column: node.column + node.length },
						result,
						ruleName: rule_name,
					})
				}
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
