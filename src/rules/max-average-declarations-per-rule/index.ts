import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { STYLE_RULE, AT_RULE, DECLARATION } from '@projectwallace/css-parser/nodes'
import { walk, SKIP } from '@projectwallace/css-parser/walker'
import { parse } from '@projectwallace/css-parser/parse'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-average-declarations-per-rule'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Average declarations per rule is ${actual} which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-average-declarations-per-rule/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [Number as unknown as (v: unknown) => boolean],
		})

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 0) {
			return
		}

		const css = root.toString()
		const ast = parse(css, { parse_selectors: false, parse_values: false })
		let total_declarations = 0
		let rule_count = 0

		walk(ast, (node) => {
			if (node.type !== STYLE_RULE) return

			rule_count++
			let decl_count = 0

			walk(node, (child, child_depth) => {
				if (child_depth === 0) return
				if (child.type === DECLARATION) decl_count++
				if (child.type === STYLE_RULE || child.type === AT_RULE) return SKIP
			})

			total_declarations += decl_count
		})

		if (rule_count === 0) return

		const actual = total_declarations / rule_count

		if (actual > primaryOption) {
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node: root,
				result,
				ruleName: rule_name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
