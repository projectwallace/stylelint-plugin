import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-static-container-query'

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

test('min-width — range feature, no error', async () => {
	const { errored, warnings } = await lint('@container (min-width: 300px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('max-width — range feature, no error', async () => {
	const { errored, warnings } = await lint('@container (max-width: 300px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('non-conflicting min/max range, no error', async () => {
	const { errored, warnings } = await lint(
		'@container (min-width: 100px) and (max-width: 1000px) {}',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('modern range syntax — no error', async () => {
	const { errored, warnings } = await lint('@container (width >= 300px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('double-sided range syntax — no error', async () => {
	const { errored, warnings } = await lint('@container (100px <= width <= 1000px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('boolean feature without value — no error', async () => {
	const { errored, warnings } = await lint('@container (min-inline-size: 300px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('no @container at all', async () => {
	const { errored, warnings } = await lint('a { color: red }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('not operator — skip, no error', async () => {
	const { errored, warnings } = await lint('@container not (width: 300px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('named container with range feature — no error', async () => {
	const { errored, warnings } = await lint('@container sidebar (min-width: 600px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('comma-separated queries are independent — no error when neither uses equality', async () => {
	const { errored, warnings } = await lint('@container (min-width: 1000px), (max-width: 500px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// === Invalid cases (should error) ===

test('equality width alone — error', async () => {
	const { errored, warnings } = await lint('@container (width: 300px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Container feature "width: 300px" is a static equality condition that will almost never match any container (${rule_name})`,
	)
	expect(warnings[0].line).toBe(1)
	expect(warnings[0].column).toBe(1)
})

test('named container with equality width — error', async () => {
	const { errored, warnings } = await lint('@container sidebar (width: 300px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Container feature "width: 300px" is a static equality condition that will almost never match any container (${rule_name})`,
	)
})

test('equality width with conflicting min-width — error', async () => {
	const { errored, warnings } = await lint('@container (width: 300px) and (min-width: 400px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Container feature "width: 300px" is a static equality condition that will almost never match any container (${rule_name})`,
	)
})

test('equality width with conflicting max-width — error', async () => {
	const { errored, warnings } = await lint('@container (width: 300px) and (max-width: 200px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Container feature "width: 300px" is a static equality condition that will almost never match any container (${rule_name})`,
	)
})

test('equality height alone — error', async () => {
	const { errored, warnings } = await lint('@container (height: 300px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Container feature "height: 300px" is a static equality condition that will almost never match any container (${rule_name})`,
	)
})

test('equality inline-size alone — error', async () => {
	const { errored, warnings } = await lint('@container (inline-size: 300px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Container feature "inline-size: 300px" is a static equality condition that will almost never match any container (${rule_name})`,
	)
})

test('equality block-size alone — error', async () => {
	const { errored, warnings } = await lint('@container (block-size: 300px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Container feature "block-size: 300px" is a static equality condition that will almost never match any container (${rule_name})`,
	)
})

test('multiple @container rules each with equality syntax — two errors', async () => {
	const { errored, warnings } = await lint(`
		@container (width: 300px) {}
		@container (height: 500px) {}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

// === Other units ===

test('equality width in em — error', async () => {
	const { errored, warnings } = await lint('@container (width: 30em) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Container feature "width: 30em" is a static equality condition that will almost never match any container (${rule_name})`,
	)
})

test('equality width in rem — error', async () => {
	const { errored, warnings } = await lint('@container (width: 30rem) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Container feature "width: 30rem" is a static equality condition that will almost never match any container (${rule_name})`,
	)
})

test('min-width in em — no error', async () => {
	const { errored, warnings } = await lint('@container (min-width: 30em) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})
