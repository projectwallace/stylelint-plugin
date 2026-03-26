import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
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
	collect_bounds_from_prelude,
	find_contradictory_feature,
} from '../../utils/media-conditions.js'
import type { Bound, ContradictionInfo } from '../../utils/media-conditions.js'

/** Cartesian product of an array of arrays. */
function cartesian<T>(arrays: T[][]): T[][] {
	if (arrays.length === 0) return [[]]
	const [first, ...rest] = arrays
	const rest_product = cartesian(rest)
	return first.flatMap((item) => rest_product.map((combo) => [item, ...combo]))
}

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unreachable-media-conditions'

const messages = utils.ruleMessages(rule_name, {
	rejected: (feature: string, lower: string, upper: string) =>
		`Media feature "${feature}" creates an unreachable condition: lower bound (${lower}) exceeds upper bound (${upper})`,
	rejected_nested: (feature: string, lower: string, upper: string) =>
		`Media feature "${feature}" creates an unreachable condition across nested @media rules: lower bound (${lower}) exceeds upper bound (${upper})`,
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

		// === Detect contradictions within a single @media / @import rule ===

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

		// === Detect contradictions introduced by nested @media rules ===
		// Nested @media rules implicitly AND their conditions with all ancestor
		// @media rules, so (min-width: 1000px) { @media (max-width: 500px) }
		// is equivalent to @media (min-width: 1000px) and (max-width: 500px).
		//
		// Comma-separated ancestor queries are treated as alternatives. We take the
		// cartesian product across all nesting levels and report the first combination
		// that is contradictory.

		root.walkAtRules(/^media$/i, (atRule) => {
			// Collect alternative bound-sets from the current rule and each ancestor
			const current_alternatives = collect_bounds_from_prelude('media', atRule.params)
			if (current_alternatives.length === 0) return

			const ancestor_alternative_sets: (Bound[] | null)[][] = []
			let node = atRule.parent

			while (node) {
				if (node.type === 'atrule' && (node as AtRule).name.toLowerCase() === 'media') {
					const ancestor = node as AtRule
					const alternatives = collect_bounds_from_prelude('media', ancestor.params)
					if (alternatives.length === 0) return // empty prelude — bail out
					ancestor_alternative_sets.push(alternatives)
				}
				node = node.parent
			}

			if (ancestor_alternative_sets.length === 0) return // not nested

			// Cartesian product of [current, ancestor1, ancestor2, ...]
			const all_sets: (Bound[] | null)[][] = [current_alternatives, ...ancestor_alternative_sets]

			let nested_contradiction: ContradictionInfo | null = null

			for (const combo of cartesian(all_sets)) {
				// Any unanalyzable branch → conservatively skip this combination
				if (combo.some((b) => b === null)) continue

				const bound_sets = combo as Bound[][]

				// If current branch alone is contradictory, the flat check above handles
				// it — skip this combination to avoid double-reporting
				if (find_contradictory_feature(bound_sets[0]) !== null) continue

				// If the ancestor bounds for this specific combination are already
				// contradictory amongst themselves, the contradiction belongs to the
				// ancestor level and will be (or was) reported there — skip to avoid noise
				if (find_contradictory_feature(bound_sets.slice(1).flat()) !== null) continue

				const contradiction = find_contradictory_feature(bound_sets.flat())
				if (contradiction !== null) {
					nested_contradiction = contradiction
					break
				}
			}

			if (nested_contradiction === null) return

			const lower = `${nested_contradiction.lower.value}${nested_contradiction.lower.unit}`
			const upper = `${nested_contradiction.upper.value}${nested_contradiction.upper.unit}`
			utils.report({
				message: messages.rejected_nested(nested_contradiction.feature, lower, upper),
				node: atRule,
				word: '@media',
				result,
				ruleName: rule_name,
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
