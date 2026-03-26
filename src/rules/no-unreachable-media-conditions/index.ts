import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	AT_RULE,
	MEDIA_QUERY,
	MEDIA_FEATURE,
	FEATURE_RANGE,
	PRELUDE_OPERATOR,
} from '@projectwallace/css-parser/nodes'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { BREAK, walk } from '@projectwallace/css-parser/walker'
import { parse } from '@projectwallace/css-parser/parse'
import {
	collect_bound_from_media_feature,
	collect_bounds_from_feature_range,
	find_contradictory_feature,
} from '../../utils/media-conditions.js'
import type { Bound, ContradictionInfo } from '../../utils/media-conditions.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unreachable-media-conditions'

const messages = utils.ruleMessages(rule_name, {
	rejected: (feature: string, lower: string, upper: string) =>
		`Media feature "${feature}" creates an unreachable condition: lower bound (${lower}) exceeds upper bound (${upper})`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unreachable-media-conditions/README.md',
}

/**
 * Parse an at-rule prelude and return info about the first contradictory feature,
 * or null if all media conditions are satisfiable.
 */
function find_contradiction_in_prelude(
	at_rule_name: string,
	prelude: string,
): ContradictionInfo | null {
	const parsed = parse_atrule_prelude(at_rule_name, prelude)

	for (const query_node of parsed) {
		if (query_node.type !== MEDIA_QUERY) continue

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

		// Collect all bounds from this media query
		const bounds: Bound[] = []

		walk(query_node, (node) => {
			if (node.type === MEDIA_FEATURE) {
				bounds.push(...collect_bound_from_media_feature(node))
			} else if (node.type === FEATURE_RANGE) {
				bounds.push(...collect_bounds_from_feature_range(node))
			}
		})

		const contradictory_feature = find_contradictory_feature(bounds)
		if (contradictory_feature !== null) return contradictory_feature
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
			if (node.name !== 'media' && node.name !== 'import') return

			const prelude = node.prelude?.text
			if (!prelude) return

			const contradictory_feature = find_contradiction_in_prelude(node.name, prelude)

			if (contradictory_feature !== null) {
				const lower = `${contradictory_feature.lower.value}${contradictory_feature.lower.unit}`
				const upper = `${contradictory_feature.upper.value}${contradictory_feature.upper.unit}`
				utils.report({
					message: messages.rejected(contradictory_feature.feature, lower, upper),
					node: root,
					start: { line: node.line + line_offset, column: node.column },
					end: {
						line: node.line + line_offset,
						column: node.column + `@${node.name}`.length,
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
