import {
	is_container_query,
	is_dimension,
	is_feature_range,
	is_media_feature,
	is_media_query,
	is_number,
	is_prelude_operator,
	type CSSNode,
} from '@projectwallace/css-parser'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { BREAK, walk } from '@projectwallace/css-parser/walker'

export type Bound = {
	feature: string
	value: number
	unit: string
	inclusive: boolean
	direction: 'lower' | 'upper'
}

/**
 * Extract bounds from an old-style MEDIA_FEATURE node like (min-width: 1000px) or (width: 300px).
 * For min-/max- prefixed features, returns a single bound.
 * For unprefixed features with a numeric value (equality syntax like `width: 300px`),
 * returns two bounds — one lower and one upper at the same value, both inclusive —
 * making them compatible with find_contradictory_feature.
 * Returns an empty array if the feature is not a numeric range-style feature.
 */
export function collect_bound_from_media_feature(node: CSSNode): Bound[] {
	if (!is_media_feature(node)) return []

	const property = node.property
	if (!property) return []

	let direction: 'lower' | 'upper' | 'both'
	let feature: string

	if (property.startsWith('min-')) {
		direction = 'lower'
		feature = property.slice(4)
	} else if (property.startsWith('max-')) {
		direction = 'upper'
		feature = property.slice(4)
	} else {
		direction = 'both'
		feature = property
	}

	// Find first DIMENSION or NUMBER child
	for (const child of node.children) {
		if (is_dimension(child) || is_number(child)) {
			const value = child.value
			const unit = is_dimension(child) ? child.unit : ''
			if (value == null || Number.isNaN(value)) return []
			if (direction === 'both') {
				return [
					{ feature, value, unit, inclusive: true, direction: 'lower' },
					{ feature, value, unit, inclusive: true, direction: 'upper' },
				]
			}
			return [{ feature, value, unit, inclusive: true, direction }]
		}
	}

	return []
}

/**
 * Extract bounds from a FEATURE_RANGE node like (width > 1000px) or (50px <= width <= 100px).
 * Returns an array of bounds (0, 1, or 2 items), each tagged with the feature name.
 */
export function collect_bounds_from_feature_range(node: CSSNode): Bound[] {
	if (!is_feature_range(node)) return []

	const feature = node.name
	if (!feature) return []

	const count = node.child_count
	if (count === 0) return []

	const bounds: Bound[] = []

	const is_value_node = (n: CSSNode) => is_dimension(n) || is_number(n)
	// FeatureRange children are typed as (Dimension | Operator)[] but actually include
	// PreludeOperator nodes — cast to CSSNode[] to allow proper narrowing
	const children = node.children as CSSNode[]

	const child0 = children[0]
	const child1 = children[1]
	const child2 = children[2]
	const child3 = children[3]

	// Case A: [OPERATOR, VALUE] → feature OPERATOR value (e.g. width >= 400px, device-pixel-ratio > 2)
	if (count >= 2 && is_prelude_operator(child0) && is_value_node(child1)) {
		const operator = child0.text.trim()
		const dimension = child1
		const value = dimension.value
		const unit = is_dimension(dimension) ? dimension.unit : ''
		if (value != null && !Number.isNaN(value)) {
			const bound = operator_to_bound(operator, value, unit, 'feature_left')
			if (bound) bounds.push({ ...bound, feature })
		}
	}
	// Case B: [VALUE, OPERATOR, OPERATOR, VALUE] → value1 OP1 feature OP2 value2
	else if (
		count >= 4 &&
		is_value_node(child0) &&
		is_prelude_operator(child1) &&
		is_prelude_operator(child2) &&
		is_value_node(child3)
	) {
		const dimension1 = child0
		const operator1 = child1.text.trim()
		const operator2 = child2.text.trim()
		const dimension2 = child3

		const value1 = dimension1.value
		const unit1 = is_dimension(dimension1) ? dimension1.unit : ''
		const value2 = dimension2.value
		const unit2 = is_dimension(dimension2) ? dimension2.unit : ''

		// dimension1 OP1 feature → feature is on the right side of OP1
		if (value1 != null && !Number.isNaN(value1)) {
			const bound = operator_to_bound(operator1, value1, unit1, 'feature_right')
			if (bound) bounds.push({ ...bound, feature })
		}
		// feature OP2 dimension2 → feature is on the left side of OP2
		if (value2 != null && !Number.isNaN(value2)) {
			const bound = operator_to_bound(operator2, value2, unit2, 'feature_left')
			if (bound) bounds.push({ ...bound, feature })
		}
	}

	return bounds
}

/**
 * Convert an operator and dimension to a Bound, given whether the feature
 * is on the left or right side of the operator.
 *
 * feature_left:  feature OP value  e.g. width >= 400px
 * feature_right: value OP feature  e.g. 400px <= width
 *
 * Returns null for operators that don't express a range bound (e.g. =).
 */
function operator_to_bound(
	operator: string,
	value: number,
	unit: string,
	side: 'feature_left' | 'feature_right',
): Omit<Bound, 'feature'> | null {
	if (side === 'feature_left') {
		// feature > value → lower exclusive  (feature must be above value)
		// feature >= value → lower inclusive
		// feature < value → upper exclusive  (feature must be below value)
		// feature <= value → upper inclusive
		if (operator === '>') return { value, unit, inclusive: false, direction: 'lower' }
		if (operator === '>=') return { value, unit, inclusive: true, direction: 'lower' }
		if (operator === '<') return { value, unit, inclusive: false, direction: 'upper' }
		if (operator === '<=') return { value, unit, inclusive: true, direction: 'upper' }
	} else {
		// value < feature → lower exclusive  (feature must be above value)
		// value <= feature → lower inclusive
		// value > feature → upper exclusive  (feature must be below value)
		// value >= feature → upper inclusive
		if (operator === '<') return { value, unit, inclusive: false, direction: 'lower' }
		if (operator === '<=') return { value, unit, inclusive: true, direction: 'lower' }
		if (operator === '>') return { value, unit, inclusive: false, direction: 'upper' }
		if (operator === '>=') return { value, unit, inclusive: true, direction: 'upper' }
	}
	return null
}

export type ContradictionInfo = {
	feature: string
	lower: Bound
	upper: Bound
}

/**
 * Parse an at-rule prelude and return one Bound[] per comma-separated query branch.
 *
 * Each element corresponds to one branch (comma-separated query):
 *   - Bound[]  — the numeric range bounds extracted from that branch
 *   - null     — that branch contains `not` or `or`, too complex to analyse
 *
 * An empty array is returned when the prelude contains no recognisable query nodes.
 *
 * Handles both @media (MEDIA_QUERY) and @container (CONTAINER_QUERY) preludes.
 */
export function collect_bounds_from_prelude(
	at_rule_name: string,
	prelude: string,
): (Bound[] | null)[] {
	const parsed = parse_atrule_prelude(at_rule_name, prelude)

	const result: (Bound[] | null)[] = []
	for (const node of parsed) {
		if (!is_media_query(node) && !is_container_query(node)) continue

		// Skip branches that contain `not` or `or` — too complex to analyse
		let skip = false
		walk(node, (child) => {
			if (is_prelude_operator(child)) {
				const operator = child.text.trim().toLowerCase()
				if (operator === 'not' || operator === 'or') {
					skip = true
					return BREAK
				}
			}
		})
		if (skip) {
			result.push(null)
			continue
		}

		const bounds: Bound[] = []
		walk(node, (child) => {
			if (is_media_feature(child)) {
				bounds.push(...collect_bound_from_media_feature(child))
			} else if (is_feature_range(child)) {
				bounds.push(...collect_bounds_from_feature_range(child))
			}
		})
		result.push(bounds)
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
	// Group bounds by feature name
	const by_feature = new Map<string, Bound[]>()
	for (const bound of bounds) {
		const existing = by_feature.get(bound.feature) ?? []
		existing.push(bound)
		by_feature.set(bound.feature, existing)
	}

	for (const [feature, feature_bounds] of by_feature) {
		const lower_bounds = feature_bounds.filter((b) => b.direction === 'lower')
		const upper_bounds = feature_bounds.filter((b) => b.direction === 'upper')

		if (lower_bounds.length === 0 || upper_bounds.length === 0) continue

		// Only compare bounds with the same unit
		const lower_units = new Set(lower_bounds.map((b) => b.unit))

		for (const unit of lower_units) {
			const uppers_same_unit = upper_bounds.filter((b) => b.unit === unit)
			if (uppers_same_unit.length === 0) continue

			const lowers_same_unit = lower_bounds.filter((b) => b.unit === unit)

			// Most restrictive lower = highest value; tie-break: exclusive > inclusive
			const max_lower = lowers_same_unit.reduce((a, b) => {
				if (b.value > a.value) return b
				if (b.value === a.value && !b.inclusive && a.inclusive) return b
				return a
			})

			// Most restrictive upper = lowest value; tie-break: exclusive > inclusive
			const min_upper = uppers_same_unit.reduce((a, b) => {
				if (b.value < a.value) return b
				if (b.value === a.value && !b.inclusive && a.inclusive) return b
				return a
			})

			if (max_lower.value > min_upper.value) return { feature, lower: max_lower, upper: min_upper }
			if (max_lower.value === min_upper.value && (!max_lower.inclusive || !min_upper.inclusive))
				return { feature, lower: max_lower, upper: min_upper }
		}
	}

	return null
}
