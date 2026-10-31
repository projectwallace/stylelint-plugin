import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-invalid-container-features'

async function lint(code: string, primaryOption: unknown = true) {
	const config = { plugins: [plugin], rules: { [rule_name]: primaryOption } }
	const {
		results: [result],
	} = await stylelint.lint({ code, config })
	return result
}

// ---------------------------------------------------------------------------
// Invalid options
// ---------------------------------------------------------------------------

test('should not run when primary option is invalid', async () => {
	const { errored } = await lint('@container card (height > 1px) {}', 'nope')
	expect(errored).toBe(true)
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test.each([
	['inline-size + width', '.a{container:card/inline-size}@container card (width > 1px){}'],
	[
		'inline-size + inline-size',
		'.a{container-name:card;container-type:inline-size}@container card (min-inline-size:1px){}',
	],
	['inline-size + style()', '.a{container:card/inline-size}@container card style(--x: 1){}'],
	['size + height', '.a{container:card/size}@container card (height > 1px){}'],
	['size + aspect-ratio', '.a{container:card/size}@container card (aspect-ratio > 1){}'],
	['size + orientation', '.a{container:card/size}@container card (orientation: landscape){}'],
	['normal + style()', '.a{container:card}@container card style(--x: 1){}'],
	[
		'scroll-state declared',
		'.a{container:s/inline-size scroll-state}@container s scroll-state(stuck: top){}',
	],
	['unnamed query', '.a{container:card/inline-size}@container (height > 1px){}'],
	['unknown name', '@container card (height > 1px){}'],
	['var() type', '.a{container-name:card;container-type:var(--t)}@container card (height > 1px){}'],
	['name without type', '.a{container-name:card}@container card (height > 1px){}'],
	[
		'global keyword',
		'.a{container-name:card;container-type:inherit}@container card (height > 1px){}',
	],
	[
		'union: size elsewhere',
		'.a{container:card/inline-size}.b{container:card/size}@container card (height > 1px){}',
	],
])('should not error when %s', async (_name, code) => {
	const { errored, warnings } = await lint(code)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test.each([
	['height', '(height > 1px)'],
	['min-height', '(min-height: 1px)'],
	['max-block-size', '(max-block-size: 1px)'],
	['block-size range', '(1px < block-size < 2px)'],
	['aspect-ratio', '(aspect-ratio > 1)'],
	['orientation', '(orientation: portrait)'],
])('should error when inline-size container is queried for %s', async (_name, query) => {
	const { errored, warnings } = await lint(
		`.a{container:card/inline-size}@container card ${query}{}`,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should error when container-type is normal and queried for width', async () => {
	const { errored, warnings } = await lint(
		'.a{container-name:card;container-type:normal}@container card (width > 1px){}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should error when inline-size container uses scroll-state()', async () => {
	const { errored, warnings } = await lint(
		'.a{container:card/inline-size}@container card scroll-state(stuck: top){}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('should only report the invalid feature of a mixed query, with position', async () => {
	const code = '.a{container:card/inline-size}\n@container card (width > 1px) and (height > 2px) {}'
	const { warnings } = await lint(code)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		line: 2,
		column: 36,
		endColumn: 42,
		text: expect.stringContaining('"height"'),
	})
})

test('should error inside not and or', async () => {
	const { warnings } = await lint(
		'.a{container:card/inline-size}@container card not (height > 1px){}@container card (height > 1px) or (width > 1px){}',
	)
	expect(warnings).toHaveLength(2)
})

test('should error when all declarations of the name lack the axis', async () => {
	const { warnings } = await lint(
		'.a{container:card/inline-size}.b{container:card/inline-size}@container card (height > 1px){}',
	)
	expect(warnings).toHaveLength(1)
})
