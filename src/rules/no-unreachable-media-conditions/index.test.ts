import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import { parse } from 'postcss'
import plugin from './index.js'

const rule_name = 'projectwallace/no-unreachable-media-conditions'

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
	const { errored, warnings } = await lint('@media (min-width: 100px) and (max-width: 1000px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('exact match bounds (min == max) — valid', async () => {
	const { errored, warnings } = await lint('@media (min-width: 500px) and (max-width: 500px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('different features (width and height) — not contradictory', async () => {
	const { errored, warnings } = await lint('@media (min-width: 1000px) and (max-height: 500px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('mixed units — skip comparison, no error', async () => {
	const { errored, warnings } = await lint('@media (min-width: 1000px) and (max-width: 500em) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('valid range syntax', async () => {
	const { errored, warnings } = await lint('@media (width >= 100px) and (width <= 1000px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('comma-separated queries are independent — no error', async () => {
	const { errored, warnings } = await lint('@media (min-width: 1000px), (max-width: 500px) {}')
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
	const { errored, warnings } = await lint('@media (min-width: 1000px) and (max-width: 500px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition: lower bound (1000px) exceeds upper bound (500px) (${rule_name})`,
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
		`Media feature "width" creates an unreachable condition: lower bound (1020px) exceeds upper bound (739px) (${rule_name})`,
	)
})

test('range syntax: width > X and width < X (exclusive equal bounds)', async () => {
	const { errored, warnings } = await lint('@media (width > 1000px) and (width < 1000px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition: lower bound (1000px) exceeds upper bound (1000px) (${rule_name})`,
	)
})

test('range syntax: width > X and width < Y where Y < X', async () => {
	const { errored, warnings } = await lint('@media (width > 1000px) and (width < 500px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('range syntax: width >= X and width <= Y where Y < X', async () => {
	const { errored, warnings } = await lint('@media (width >= 1000px) and (width <= 500px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

test('range syntax: width >= X and width < X (exclusive upper at same bound)', async () => {
	const { errored, warnings } = await lint('@media (width >= 1000px) and (width < 1000px) {}')
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
		`Media feature "width" creates an unreachable condition: lower bound (1000px) exceeds upper bound (800px) (${rule_name})`,
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

test('double-sided range where lower bound exceeds upper bound', async () => {
	const { errored, warnings } = await lint('@media (500px <= width <= 400px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition: lower bound (500px) exceeds upper bound (400px) (${rule_name})`,
	)
})

test('height: min > max should error', async () => {
	const { errored, warnings } = await lint('@media (min-height: 1000px) and (max-height: 500px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "height" creates an unreachable condition: lower bound (1000px) exceeds upper bound (500px) (${rule_name})`,
	)
})

test('inline-size (logical property): min > max should error', async () => {
	const { errored, warnings } = await lint(
		'@media (min-inline-size: 1000px) and (max-inline-size: 500px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "inline-size" creates an unreachable condition: lower bound (1000px) exceeds upper bound (500px) (${rule_name})`,
	)
})

test('device-pixel-ratio (unitless): min > max should error', async () => {
	const { errored, warnings } = await lint(
		'@media (min-device-pixel-ratio: 3) and (max-device-pixel-ratio: 1) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "device-pixel-ratio" creates an unreachable condition: lower bound (3) exceeds upper bound (1) (${rule_name})`,
	)
})

test('device-pixel-ratio range syntax: conflicting should error', async () => {
	const { errored, warnings } = await lint(
		'@media (device-pixel-ratio > 3) and (device-pixel-ratio < 1) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
})

// === @import media conditions ===

test('@import with valid media condition — no error', async () => {
	const { errored, warnings } = await lint('@import url(test.css) (100px <= width <= 1000px);')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('@import with contradictory double-sided range should error', async () => {
	const { errored, warnings } = await lint('@import url(test.css) (400px <= width <= 200px);')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition: lower bound (400px) exceeds upper bound (200px) (${rule_name})`,
	)
})

test('@import with contradictory min/max should error', async () => {
	const { errored, warnings } = await lint(
		'@import url(test.css) (min-width: 1000px) and (max-width: 500px);',
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

// === Equality-syntax (width: Xpx) combined with conflicting bounds ===

test('equality width with conflicting min-width — error', async () => {
	const { errored, warnings } = await lint('@media (width: 300px) and (min-width: 400px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition: lower bound (400px) exceeds upper bound (300px) (${rule_name})`,
	)
})

test('equality width with conflicting max-width — error', async () => {
	const { errored, warnings } = await lint('@media (width: 300px) and (max-width: 200px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition: lower bound (300px) exceeds upper bound (200px) (${rule_name})`,
	)
})

test('equality width with exclusive range bound at same value — error', async () => {
	const { errored, warnings } = await lint('@media (width: 300px) and (width > 300px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition: lower bound (300px) exceeds upper bound (300px) (${rule_name})`,
	)
})

test('equality width alone — no error (not a contradiction)', async () => {
	const { errored, warnings } = await lint('@media (width: 300px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('equality width with inclusive min-width at same value — no error', async () => {
	const { errored, warnings } = await lint('@media (width: 300px) and (min-width: 300px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('equality height with conflicting min-height — error', async () => {
	const { errored, warnings } = await lint('@media (height: 300px) and (min-height: 400px) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "height" creates an unreachable condition: lower bound (400px) exceeds upper bound (300px) (${rule_name})`,
	)
})

test('equality inline-size with conflicting min-inline-size — error', async () => {
	const { errored, warnings } = await lint(
		'@media (inline-size: 300px) and (min-inline-size: 400px) {}',
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "inline-size" creates an unreachable condition: lower bound (400px) exceeds upper bound (300px) (${rule_name})`,
	)
})

test('equality width in em with conflicting min-width in em — error', async () => {
	const { errored, warnings } = await lint('@media (width: 30em) and (min-width: 40em) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition: lower bound (40em) exceeds upper bound (30em) (${rule_name})`,
	)
})

test('equality width in em with conflicting max-width in em — error', async () => {
	const { errored, warnings } = await lint('@media (width: 30em) and (max-width: 20em) {}')
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition: lower bound (30em) exceeds upper bound (20em) (${rule_name})`,
	)
})

test('equality width in em with inclusive min-width at same value — no error', async () => {
	const { errored, warnings } = await lint('@media (width: 30em) and (min-width: 30em) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('equality width in em, conflicting bound in px — no error (mixed units)', async () => {
	const { errored, warnings } = await lint('@media (width: 30em) and (min-width: 400px) {}')
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still detect unreachable media condition when input.css offsets do not match (Svelte embedded CSS)', async () => {
	const css = '@media (min-width: 600px) and (max-width: 400px) {}'
	const svelteCustomSyntax = {
		parse(code: string, opts: object) {
			const root = parse(code, opts)
			;(root.source!.input as unknown as { css: string }).css =
				'<script>const x = 1</script><style>' + code + '</style>'
			return root
		},
		stringify: (await import('postcss')).stringify,
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: css,
		config,
		customSyntax: svelteCustomSyntax as never,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`Media feature "width" creates an unreachable condition: lower bound (600px) exceeds upper bound (400px) (${rule_name})`,
	)
})
