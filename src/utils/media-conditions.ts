import { get_feature_bounds } from '@projectwallace/css-analyzer/atrules'
import {
	is_container_query,
	is_media_query,
	is_prelude_operator,
} from '@projectwallace/css-parser/node-types'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { BREAK, walk } from '@projectwallace/css-parser/walker'
import { str_equals } from '@projectwallace/css-parser/string-utils'

export type Bound = {
	feature: string
	value: number
	unit: string
	inclusive: boolean
	direction: 'lower' | 'upper'
}

export type ContradictionInfo = {
	feature: string
	lower: Bound
	upper: Bound
}

/**
 * Collect the numeric bounds of every comma separated query in a `@media`, `@import` or `@container` prelude.
 * Queries that contain `not` or `or` are too complex to analyse safely and yield `null`.
 * An equality like `(width: 300px)` becomes a lower and an upper bound at the same value.
 */
export function collect_bounds_from_prelude(
	at_rule_name: string,
	prelude: string,
): (Bound[] | null)[] {
	const parsed = parse_atrule_prelude(at_rule_name, prelude)
	const name = str_equals('container', at_rule_name) ? 'container' : 'media'

	function bounds_of(query: string): Bound[] {
		const bounds: Bound[] = []
		for (const { feature, direction, value, unit, inclusive } of get_feature_bounds(query, name)) {
			if (direction !== 'max') {
				bounds.push({ feature, value, unit, inclusive, direction: 'lower' })
			}
			if (direction !== 'min') {
				bounds.push({ feature, value, unit, inclusive, direction: 'upper' })
			}
		}
		return bounds
	}

	const result: (Bound[] | null)[] = []
	for (const node of parsed) {
		if (!is_media_query(node) && !is_container_query(node)) {
			continue
		}

		let skip = false
		walk(node, (child) => {
			if (is_prelude_operator(child)) {
				const operator = child.text.trim()
				if (str_equals('not', operator) || str_equals('or', operator)) {
					skip = true
					return BREAK
				}
			}
		})
		result.push(skip ? null : bounds_of(node.text))
	}

	return result
}

/**
 * Given a list of bounds for potentially multiple features, check whether any
 * feature's combined constraints are contradictory (impossible to satisfy).
 *
 * Bounds with different units are only compared within the same unit.
 * Returns info about the first contradictory feature, or null if no contradiction found.
 */
export function find_contradictory_feature(bounds: Bound[]): ContradictionInfo | null {
	// Group bounds by feature name (case-insensitive: `WIDTH` and `width` are the same feature)
	const by_feature = new Map<string, Bound[]>()
	for (const bound of bounds) {
		const key = bound.feature.toLowerCase()
		const existing = by_feature.get(key) ?? []
		existing.push(bound)
		by_feature.set(key, existing)
	}

	for (const [feature, feature_bounds] of by_feature) {
		const lower_bounds = feature_bounds.filter((b) => b.direction === 'lower')
		const upper_bounds = feature_bounds.filter((b) => b.direction === 'upper')

		if (lower_bounds.length === 0 || upper_bounds.length === 0) {
			continue
		}

		// Only compare bounds with the same unit (case-insensitive: `PX` and `px` are the same unit)
		const lower_units = new Set(lower_bounds.map((b) => b.unit.toLowerCase()))

		for (const unit of lower_units) {
			const uppers_same_unit = upper_bounds.filter((b) => str_equals(unit, b.unit))
			if (uppers_same_unit.length === 0) {
				continue
			}

			const lowers_same_unit = lower_bounds.filter((b) => str_equals(unit, b.unit))

			// Most restrictive lower = highest value; tie-break: exclusive > inclusive
			const max_lower = lowers_same_unit.reduce((a, b) => {
				if (b.value > a.value) {
					return b
				}
				if (b.value === a.value && !b.inclusive && a.inclusive) {
					return b
				}
				return a
			})

			// Most restrictive upper = lowest value; tie-break: exclusive > inclusive
			const min_upper = uppers_same_unit.reduce((a, b) => {
				if (b.value < a.value) {
					return b
				}
				if (b.value === a.value && !b.inclusive && a.inclusive) {
					return b
				}
				return a
			})

			if (max_lower.value > min_upper.value) {
				return { feature, lower: max_lower, upper: min_upper }
			}
			if (max_lower.value === min_upper.value && (!max_lower.inclusive || !min_upper.inclusive)) {
				return { feature, lower: max_lower, upper: min_upper }
			}
		}
	}

	return null
}
