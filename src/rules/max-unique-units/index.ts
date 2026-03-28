import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_declaration } from '@projectwallace/css-parser/parse-declaration'
import { walk, DIMENSION } from '@projectwallace/css-parser'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-units'

const messages = utils.ruleMessages(rule_name, {
	rejected: (unique_units: Set<string>, expected: number) =>
		`Found ${unique_units.size} unique CSS units which is more than the allowed ${expected} (Found units: ${Array.from(unique_units).join(', ')})`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-units/README.md',
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

		const css = root.source!.input.css
		const unique_units = new Set<string>()

		root.walkDecls((declaration) => {
			const decl_source = css.substring(
				declaration.source!.start!.offset,
				declaration.source!.end!.offset,
			)
			const parsed = parse_declaration(decl_source)

			walk(parsed, (node) => {
				if (node.type === DIMENSION) {
					const unit = node.unit
					if (unit !== undefined) {
						unique_units.add(unit.toLowerCase())
					}
				}
			})
		})

		const actual = unique_units.size

		if (actual > primaryOption) {
			utils.report({
				message: messages.rejected(unique_units, primaryOption),
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
