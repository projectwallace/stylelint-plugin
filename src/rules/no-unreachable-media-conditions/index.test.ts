import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'project-wallace/no-unreachable-media-conditions'

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

test('media type only', async () => {
	const { errored, warnings } = await lint('@media screen {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('non-conflicting min/max width', async () => {
	const { errored, warnings } = await lint(
		'@media (min-width: 100px) and (max-width: 1000px) {}',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('exact match bounds (min == max) — valid', async () => {
	const { errored, warnings } = await lint(
		'@media (min-width: 500px) and (max-width: 500px) {}',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('different features (width and height) — not contradictory', async () => {
	const { errored, warnings } = await lint(
		'@media (min-width: 1000px) and (max-height: 500px) {}',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('mixed units — skip comparison, no error', async () => {
	const { errored, warnings } = await lint(
		'@media (min-width: 1000px) and (max-width: 500em) {}',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('valid range syntax', async () => {
	const { errored, warnings } = await lint(
		'@media (width >= 100px) and (width <= 1000px) {}',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('comma-separated queries are independent — no error', async () => {
	const { errored, warnings } = await lint(
		'@media (min-width: 1000px), (max-width: 500px) {}',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('not operator — skip, no error', async () => {
	const { errored, warnings } = await lint('@media not screen {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('no @media at all', async () => {
	const { errored, warnings } = await lint('a { color: red }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('valid double-sided range syntax', async () => {
	const { errored, warnings } = await lint('@media (100px <= width <= 1000px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('valid single feature with no range', async () => {
	const { errored, warnings } = await lint('@media (min-width: 768px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('screen and valid min-width', async () => {
	const { errored, warnings } = await lint(
		'@media screen and (min-width: 768px) and (max-width: 1024px) {}',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// === Invalid cases (should error) ===

test('min-width greater than max-width', async () => {
	const { errored, warnings } = await lint(
		'@media (min-width: 1000px) and (max-width: 500px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
	expect(warnings[0].line).toBe(1)
	expect(warnings[0].column).toBe(1)
})

test('issue example: screen and conflicting min/max', async () => {
	const { errored, warnings } = await lint(
		'@media screen and (min-width: 1020px) and (max-width: 739px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
})

test('range syntax: width > X and width < X (exclusive equal bounds)', async () => {
	const { errored, warnings } = await lint(
		'@media (width > 1000px) and (width < 1000px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
})

test('range syntax: width > X and width < Y where Y < X', async () => {
	const { errored, warnings } = await lint(
		'@media (width > 1000px) and (width < 500px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('range syntax: width >= X and width <= Y where Y < X', async () => {
	const { errored, warnings } = await lint(
		'@media (width >= 1000px) and (width <= 500px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('range syntax: width >= X and width < X (exclusive upper at same bound)', async () => {
	const { errored, warnings } = await lint(
		'@media (width >= 1000px) and (width < 1000px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('mix of old and new syntax: double-sided range conflicts with min-width', async () => {
	const { errored, warnings } = await lint(
		'@media (500px <= width <= 800px) and (min-width: 1000px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
})

test('issue example: multiple conflicting min/max constraints', async () => {
	const { errored, warnings } = await lint(
		'@media screen and (min-width: 740px) and (max-width: 1019px) and (min-width: 1020px) and (max-width: 1135px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('only one report per @media rule even with multiple conflicting features', async () => {
	const { errored, warnings } = await lint(
		'@media (min-width: 1000px) and (max-width: 500px) and (min-height: 800px) and (max-height: 400px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('multiple @media rules each with an error', async () => {
	const { errored, warnings } = await lint(`
		@media (min-width: 1000px) and (max-width: 500px) {}
		@media (min-width: 2000px) and (max-width: 100px) {}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})
