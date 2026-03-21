import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-static-media-query'

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

test('min-width — range feature, no error', async () => {
	const { errored, warnings } = await lint('@media (min-width: 300px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('max-width — range feature, no error', async () => {
	const { errored, warnings } = await lint('@media (max-width: 300px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('non-conflicting min/max range, no error', async () => {
	const { errored, warnings } = await lint('@media (min-width: 100px) and (max-width: 1000px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('modern range syntax — no error', async () => {
	const { errored, warnings } = await lint('@media (width >= 300px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('double-sided range syntax — no error', async () => {
	const { errored, warnings } = await lint('@media (100px <= width <= 1000px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('keyword feature (non-numeric) — no error', async () => {
	const { errored, warnings } = await lint('@media (prefers-color-scheme: dark) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('boolean feature without value — no error', async () => {
	const { errored, warnings } = await lint('@media (color) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('no @media at all', async () => {
	const { errored, warnings } = await lint('a { color: red }')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('not operator — skip, no error', async () => {
	const { errored, warnings } = await lint('@media not screen {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('comma-separated queries are independent — no error when neither uses equality', async () => {
	const { errored, warnings } = await lint('@media (min-width: 1000px), (max-width: 500px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('valid @import media condition — no error', async () => {
	const { errored, warnings } = await lint(
		'@import url(test.css) (min-width: 600px) and (max-width: 1200px);',
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// === Invalid cases (should error) ===

test('equality width alone — error', async () => {
	const { errored, warnings } = await lint('@media (width: 300px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
	expect(warnings[0].line).toBe(1)
	expect(warnings[0].column).toBe(1)
})

test('equality width with conflicting min-width — error', async () => {
	const { errored, warnings } = await lint('@media (width: 300px) and (min-width: 400px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
})

test('equality width with conflicting max-width — error', async () => {
	const { errored, warnings } = await lint('@media (width: 300px) and (max-width: 200px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
})

test('equality width with exclusive range bound at same value — error', async () => {
	const { errored, warnings } = await lint('@media (width: 300px) and (width > 300px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
})

test('equality width with inclusive min-width at same value — still a static condition, error', async () => {
	const { errored, warnings } = await lint('@media (width: 300px) and (min-width: 300px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
})

test('equality height alone — error', async () => {
	const { errored, warnings } = await lint('@media (height: 300px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "height" creates an unreachable condition (${rule_name})`,
	)
})

test('equality height with conflicting min-height — error', async () => {
	const { errored, warnings } = await lint('@media (height: 300px) and (min-height: 400px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "height" creates an unreachable condition (${rule_name})`,
	)
})

test('equality inline-size alone — error', async () => {
	const { errored, warnings } = await lint('@media (inline-size: 300px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "inline-size" creates an unreachable condition (${rule_name})`,
	)
})

test('equality inline-size with conflicting min-inline-size — error', async () => {
	const { errored, warnings } = await lint(
		'@media (inline-size: 300px) and (min-inline-size: 400px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "inline-size" creates an unreachable condition (${rule_name})`,
	)
})

test('@import with equality syntax — error', async () => {
	const { errored, warnings } = await lint('@import url(test.css) (width: 300px);')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
})

test('screen and equality width — error', async () => {
	const { errored, warnings } = await lint('@media screen and (width: 768px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('multiple @media rules each with equality syntax — two errors', async () => {
	const { errored, warnings } = await lint(`
		@media (width: 300px) {}
		@media (height: 500px) {}
	`)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

// === Other units ===

test('equality width in em — error', async () => {
	const { errored, warnings } = await lint('@media (width: 30em) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
})

test('equality width in rem — error', async () => {
	const { errored, warnings } = await lint('@media (width: 30rem) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
})

test('min-width in em — no error', async () => {
	const { errored, warnings } = await lint('@media (min-width: 30em) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('equality width in em with conflicting min-width in em — error', async () => {
	const { errored, warnings } = await lint('@media (width: 30em) and (min-width: 40em) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition (${rule_name})`,
	)
})
