import { MEDIA_FEATURE, FEATURE_RANGE, PRELUDE_OPERATOR, DIMENSION } from '@projectwallace/css-parser'
import type { CSSNode } from '@projectwallace/css-parser'

export type Bound = {
	feature: string
	value: number
	unit: string
	inclusive: boolean
	direction: 'lower' | 'upper'
}

/**
 * Extract a bound from an old-style MEDIA_FEATURE node like (min-width: 1000px).
 * Returns null if the feature is not a range-style min-/max- feature.
 */
export function collect_bound_from_media_feature(node: CSSNode): Bound | null {
	if (node.type !== MEDIA_FEATURE) return null

	const property = node.property
	if (!property) return null

	let direction: 'lower' | 'upper'
	let feature: string

	if (property.startsWith('min-')) {
		direction = 'lower'
		feature = property.slice(4)
	} else if (property.startsWith('max-')) {
		direction = 'upper'
		feature = property.slice(4)
	} else {
		return null
	}

	// Find first DIMENSION child
	for (const child of node.children) {
		if (child.type === DIMENSION) {
			const value = child.value_as_number
			const unit = child.unit ?? ''
			if (value == null || Number.isNaN(value)) return null
			return { feature, value, unit, inclusive: true, direction }
		}
	}

	return null
}

/**
 * Extract bounds from a FEATURE_RANGE node like (width > 1000px) or (50px <= width <= 100px).
 * Returns an array of bounds (0, 1, or 2 items), each tagged with the feature name.
 */
export function collect_bounds_from_feature_range(node: CSSNode): Bound[] {
	if (node.type !== FEATURE_RANGE) return []

	const feature = node.name
	if (!feature) return []

	const children = node.children
	if (children.length === 0) return []

	const bounds: Bound[] = []

	// Case A: [OP, DIM] → feature OP value (e.g. width >= 400px)
	if (
		children.length >= 2 &&
		children[0].type === PRELUDE_OPERATOR &&
		children[1].type === DIMENSION
	) {
		const op = children[0].text.trim()
		const dim = children[1]
		const value = dim.value_as_number
		const unit = dim.unit ?? ''
		if (value != null && !Number.isNaN(value)) {
			const bound = operator_to_bound(op, value, unit, 'feature_left')
			if (bound) bounds.push({ ...bound, feature })
		}
	}
	// Case B: [DIM, OP, OP, DIM] → value1 OP1 feature OP2 value2 (e.g. 50px <= width <= 100px)
	else if (
		children.length >= 4 &&
		children[0].type === DIMENSION &&
		children[1].type === PRELUDE_OPERATOR &&
		children[2].type === PRELUDE_OPERATOR &&
		children[3].type === DIMENSION
	) {
		const dim1 = children[0]
		const op1 = children[1].text.trim()
		const op2 = children[2].text.trim()
		const dim2 = children[3]

		const val1 = dim1.value_as_number
		const unit1 = dim1.unit ?? ''
		const val2 = dim2.value_as_number
		const unit2 = dim2.unit ?? ''

		// dim1 OP1 feature → feature is on the right side of OP1
		if (val1 != null && !Number.isNaN(val1)) {
			const bound = operator_to_bound(op1, val1, unit1, 'feature_right')
			if (bound) bounds.push({ ...bound, feature })
		}
		// feature OP2 dim2 → feature is on the left side of OP2
		if (val2 != null && !Number.isNaN(val2)) {
			const bound = operator_to_bound(op2, val2, unit2, 'feature_left')
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
	op: string,
	value: number,
	unit: string,
	side: 'feature_left' | 'feature_right',
): Omit<Bound, 'feature'> | null {
	if (side === 'feature_left') {
		// feature > value → lower exclusive  (feature must be above value)
		// feature >= value → lower inclusive
		// feature < value → upper exclusive  (feature must be below value)
		// feature <= value → upper inclusive
		if (op === '>') return { value, unit, inclusive: false, direction: 'lower' }
		if (op === '>=') return { value, unit, inclusive: true, direction: 'lower' }
		if (op === '<') return { value, unit, inclusive: false, direction: 'upper' }
		if (op === '<=') return { value, unit, inclusive: true, direction: 'upper' }
	} else {
		// value < feature → lower exclusive  (feature must be above value)
		// value <= feature → lower inclusive
		// value > feature → upper exclusive  (feature must be below value)
		// value >= feature → upper inclusive
		if (op === '<') return { value, unit, inclusive: false, direction: 'lower' }
		if (op === '<=') return { value, unit, inclusive: true, direction: 'lower' }
		if (op === '>') return { value, unit, inclusive: false, direction: 'upper' }
		if (op === '>=') return { value, unit, inclusive: true, direction: 'upper' }
	}
	return null
}

/**
 * Given a list of bounds for potentially multiple features, check whether any
 * feature's combined constraints are contradictory (impossible to satisfy).
 *
 * Bounds with different units are only compared within the same unit.
 * Returns the name of the first contradictory feature, or null if no contradiction found.
 */
export function find_contradictory_feature(bounds: Bound[]): string | null {
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

			if (max_lower.value > min_upper.value) return feature
			if (
				max_lower.value === min_upper.value &&
				(!max_lower.inclusive || !min_upper.inclusive)
			)
				return feature
		}
	}

	return null
}
