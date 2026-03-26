import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unreachable-nested-atrule'

const config = {
	plugins: [plugin],
	rules: {
		[rule_name]: true,
	},
}

async function lint(code: string) {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({ code, config })
	return { warnings, errored }
}

// === Valid cases (no error) ===

test('not nested — no error', async () => {
	const { errored, warnings } = await lint('@media (min-width: 100px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('valid nesting: outer min < inner max', async () => {
	const { errored, warnings } = await lint(`
		@media (min-width: 300px) {
			@media (max-width: 1000px) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('valid nesting: non-conflicting features (width and height)', async () => {
	const { errored, warnings } = await lint(`
		@media (min-width: 1000px) {
			@media (max-height: 500px) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('ancestor has media type only — no bounds to AND', async () => {
	const { errored, warnings } = await lint(`
		@media screen {
			@media (max-width: 500px) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('ancestor has comma-separated queries — too complex, skip', async () => {
	const { errored, warnings } = await lint(`
		@media screen, (min-width: 1000px) {
			@media (max-width: 500px) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('ancestor has not operator — skip', async () => {
	const { errored, warnings } = await lint(`
		@media not screen {
			@media (max-width: 500px) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('mixed units — skip comparison', async () => {
	const { errored, warnings } = await lint(`
		@media (min-width: 1000px) {
			@media (max-width: 500em) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('equal bounds (min == max) — valid', async () => {
	const { errored, warnings } = await lint(`
		@media (min-width: 500px) {
			@media (max-width: 500px) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('no @media at all — no error', async () => {
	const { errored, warnings } = await lint('a { color: red }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('inner has same bounds as outer — no contradiction', async () => {
	const { errored, warnings } = await lint(`
		@media (min-width: 600px) {
			@media (min-width: 600px) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('inner rule is already contradictory — no double-report', async () => {
	// no-unreachable-media-conditions handles this; we should not double-report
	const { errored, warnings } = await lint(`
		@media (min-width: 1000px) {
			@media (min-width: 2000px) and (max-width: 100px) {}
		}
	`)
	// The inner rule is contradictory on its own, handled by the other rule
	expect(warnings).toHaveLength(0)
})

test('@container unnamed nesting — different containers, no error', async () => {
	const { errored, warnings } = await lint(`
		@container (min-width: 500px) {
			@container (max-width: 200px) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('@container different named containers — no error', async () => {
	const { errored, warnings } = await lint(`
		@container sidebar (min-width: 500px) {
			@container main (max-width: 200px) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('@container outer named, inner unnamed — no error', async () => {
	const { errored, warnings } = await lint(`
		@container sidebar (min-width: 500px) {
			@container (max-width: 200px) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('@container outer unnamed, inner named — no error', async () => {
	const { errored, warnings } = await lint(`
		@container (min-width: 500px) {
			@container sidebar (max-width: 200px) {}
		}
	`)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// === Invalid cases (should error) ===

test('nested @media: outer min-width > inner max-width', async () => {
	const { errored, warnings } = await lint(`
		@media (min-width: 1000px) {
			@media (max-width: 500px) {}
		}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Feature "width" creates an unreachable condition in nested @media rules: lower bound (1000px) exceeds upper bound (500px) (${rule_name})`,
	)
})

test('nested @media: outer max-width < inner min-width', async () => {
	const { errored, warnings } = await lint(`
		@media (max-width: 500px) {
			@media (min-width: 1000px) {}
		}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Feature "width" creates an unreachable condition in nested @media rules: lower bound (1000px) exceeds upper bound (500px) (${rule_name})`,
	)
})

test('nested @media: range syntax — outer >= 1000px, inner <= 500px', async () => {
	const { errored, warnings } = await lint(`
		@media (width >= 1000px) {
			@media (width <= 500px) {}
		}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Feature "width" creates an unreachable condition in nested @media rules: lower bound (1000px) exceeds upper bound (500px) (${rule_name})`,
	)
})

test('nested @media: exclusive bounds at same value', async () => {
	const { errored, warnings } = await lint(`
		@media (width > 500px) {
			@media (width < 500px) {}
		}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Feature "width" creates an unreachable condition in nested @media rules: lower bound (500px) exceeds upper bound (500px) (${rule_name})`,
	)
})

test('three levels deep: outermost + innermost conflict', async () => {
	const { errored, warnings } = await lint(`
		@media (min-width: 1000px) {
			@media (min-width: 800px) {
				@media (max-width: 500px) {}
			}
		}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Feature "width" creates an unreachable condition in nested @media rules: lower bound (1000px) exceeds upper bound (500px) (${rule_name})`,
	)
})

test('nested with media type: screen and conflicting bounds', async () => {
	const { errored, warnings } = await lint(`
		@media screen and (min-width: 1000px) {
			@media (max-width: 500px) {}
		}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('height: nested contradiction', async () => {
	const { errored, warnings } = await lint(`
		@media (min-height: 1000px) {
			@media (max-height: 500px) {}
		}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Feature "height" creates an unreachable condition in nested @media rules: lower bound (1000px) exceeds upper bound (500px) (${rule_name})`,
	)
})

test('@container same named containers — contradiction', async () => {
	const { errored, warnings } = await lint(`
		@container sidebar (min-width: 500px) {
			@container sidebar (max-width: 200px) {}
		}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Feature "width" creates an unreachable condition in nested @container rules: lower bound (500px) exceeds upper bound (200px) (${rule_name})`,
	)
})

test('reports on the inner rule, not the outer one', async () => {
	const { warnings } = await lint(`
		@media (min-width: 1000px) {
			@media (max-width: 500px) {}
		}
	`)
	// Line 3 is the inner @media
	expect(warnings[0].line).toBe(3)
})

test('two independent invalid nestings both reported', async () => {
	const { errored, warnings } = await lint(`
		@media (min-width: 1000px) {
			@media (max-width: 500px) {}
		}
		@media (min-width: 2000px) {
			@media (max-width: 100px) {}
		}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

test('only inner rule is flagged, not outer', async () => {
	const { warnings } = await lint(`
		@media (min-width: 1000px) {
			@media (max-width: 500px) {}
		}
	`)
	expect(warnings).toHaveLength(1)
	// Should point to the inner @media (3 tabs of indentation → column 4)
	expect(warnings[0].column).toBe(4)
})
