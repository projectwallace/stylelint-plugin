import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { AT_RULE } from '@projectwallace/css-parser/nodes'
import { walk } from '@projectwallace/css-parser/walker'
import { parse } from '@projectwallace/css-parser/parse'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unused-layers'

const messages = utils.ruleMessages(rule_name, {
	rejected: (layer: string) => `Layer "${layer}" was declared but never defined`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unused-layers/README.md',
}

interface SecondaryOptions {
	allowlist?: Array<string | RegExp>
}

const ruleFunction = (primaryOptions: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		const css = root.toString()
		const parsed = parse(css)
		const line_offset = (root.source?.start?.line ?? 1) - 1

		const declared_layers = new Map<string, { line: number; column: number }>()
		const defined_layers = new Set<string>()

		walk(parsed, (node) => {
			if (node.type !== AT_RULE) return
			if (node.name !== 'layer') return

			if (node.has_block) {
				// Block rule: @layer name { ... }
				const name = node.prelude?.text.trim()
				if (name) {
					defined_layers.add(name)
				}
			} else {
				// Statement: @layer name; or @layer a, b, c;
				const prelude_text = node.prelude?.text ?? ''
				const names = prelude_text
					.split(',')
					.map((n) => n.trim())
					.filter(Boolean)
				for (const name of names) {
					if (!declared_layers.has(name)) {
						declared_layers.set(name, { line: node.line, column: node.column })
					}
				}
			}
		})

		for (const [layer, pos] of declared_layers) {
			if (defined_layers.has(layer)) continue

			if (secondaryOptions?.allowlist) {
				const allowed = secondaryOptions.allowlist.some(
					(pattern) =>
						(typeof pattern === 'string' && pattern === layer) ||
						(pattern instanceof RegExp && pattern.test(layer)),
				)
				if (allowed) continue
			}

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(layer),
				node: root,
				start: { line: pos.line + line_offset, column: pos.column },
				end: {
					line: pos.line + line_offset,
					column: pos.column + '@layer'.length,
				},
				word: layer,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
