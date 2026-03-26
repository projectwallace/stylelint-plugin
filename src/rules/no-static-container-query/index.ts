import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	AT_RULE,
	CONTAINER_QUERY,
	MEDIA_FEATURE,
	DIMENSION,
	NUMBER,
	PRELUDE_OPERATOR,
} from '@projectwallace/css-parser/nodes'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { walk, BREAK } from '@projectwallace/css-parser/walker'
import { parse } from '@projectwallace/css-parser/parse'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-static-container-query'

const messages = utils.ruleMessages(rule_name, {
	rejected: (feature: string, value: string) =>
		`Container feature "${feature}: ${value}" is a static equality condition that will almost never match any container`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-static-container-query/README.md',
}

type StaticFeatureInfo = {
	feature: string
	value: string
}

/**
 * Parse an at-rule prelude and return the first static (equality-bound) feature name
 * and its value, or null if no static container features are found.
 *
 * A static container feature uses the equality syntax like `(width: 300px)` — without
 * a `min-` or `max-` prefix. This fixes the feature to a single exact value, which
 * almost never matches in practice.
 */
function find_static_feature_in_prelude(prelude: string): StaticFeatureInfo | null {
	const parsed = parse_atrule_prelude('container', prelude)

	for (const query_node of parsed) {
		if (query_node.type !== CONTAINER_QUERY) continue

		// Skip queries that contain `not` or `or` — too complex to analyse safely
		let skip = false
		walk(query_node, (node) => {
			if (node.type === PRELUDE_OPERATOR) {
				const operator = node.text.trim().toLowerCase()
				if (operator === 'not' || operator === 'or') {
					skip = true
					return BREAK
				}
			}
		})
		if (skip) continue

		let static_feature: StaticFeatureInfo | null = null

		walk(query_node, (node) => {
			if (static_feature !== null) return
			if (node.type !== MEDIA_FEATURE) return

			const property = node.property
			if (!property) return

			// Only check unprefixed features — min-/max- are range features
			if (property.startsWith('min-') || property.startsWith('max-')) return

			// A numeric value makes this an equality (static) condition
			for (const child of node.children) {
				if (child.type === DIMENSION || child.type === NUMBER) {
					const value = child.value_as_number
					if (value != null && !Number.isNaN(value)) {
						static_feature = { feature: property, value: child.text }
						return
					}
				}
			}
		})

		if (static_feature !== null) return static_feature
	}

	return null
}

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) return

		const css = root.toString()
		const parsed = parse(css, {
			parse_selectors: false,
			parse_values: false,
		})
		const line_offset = (root.source?.start?.line ?? 1) - 1

		walk(parsed, (node) => {
			if (node.type !== AT_RULE) return
			if (node.name !== 'container') return

			const prelude = node.prelude?.text
			if (!prelude) return

			const static_feature = find_static_feature_in_prelude(prelude)

			if (static_feature !== null) {
				utils.report({
					message: messages.rejected(static_feature.feature, static_feature.value),
					node: root,
					start: { line: node.line + line_offset, column: node.column },
					end: {
						line: node.line + line_offset,
						column: node.column + '@container'.length,
					},
					result,
					ruleName: rule_name,
				})
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
