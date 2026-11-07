import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-duplicate-font-faces'

async function lint(code: string, primaryOption: unknown) {
	const config = {
		plugins: [plugin],
		rules: { [rule_name]: primaryOption },
	}
	const {
		results: [result],
	} = await stylelint.lint({ code, config })
	return result
}

// ---------------------------------------------------------------------------
// Invalid options
// ---------------------------------------------------------------------------

test('should not run when option is invalid', async () => {
	const { errored } = await lint('a {}', false)
	expect(errored).toBe(true)
})

// ---------------------------------------------------------------------------
// No violation
// ---------------------------------------------------------------------------

test('should not error when there are no @font-face rules', async () => {
	const { warnings, errored } = await lint('a { color: red; }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error for a single @font-face', async () => {
	const { warnings, errored } = await lint(
		`@font-face { font-family: Inter; src: url(a.woff2); }`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when font-weight differs', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; font-weight: 400; src: url(a.woff2); }
		@font-face { font-family: Inter; font-weight: 700; src: url(b.woff2); }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when font-style differs', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; font-style: normal; src: url(a.woff2); }
		@font-face { font-family: Inter; font-style: italic; src: url(b.woff2); }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when font-stretch differs', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; font-stretch: 100%; src: url(a.woff2); }
		@font-face { font-family: Inter; font-stretch: 75%; src: url(b.woff2); }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when unicode-range differs (subsetting)', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; unicode-range: U+0000-00FF; src: url(latin.woff2); }
		@font-face { font-family: Inter; unicode-range: U+0400-045F; src: url(cyrillic.woff2); }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when families differ', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; src: url(a.woff2); }
		@font-face { font-family: Lora; src: url(b.woff2); }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when the same face is declared in different at-rule contexts', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; src: url(a.woff2); }
		@media print { @font-face { font-family: Inter; src: url(print.woff2); } }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when @font-face has no font-family', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { src: url(a.woff2); }
		@font-face { src: url(b.woff2); }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violations
// ---------------------------------------------------------------------------

test('should error when the same face is declared twice', async () => {
	const { warnings, errored } = await lint(
		`
		@font-face { font-family: Inter; src: url(a.woff2); }
		@font-face { font-family: Inter; src: url(a.woff2); }
	`,
		true,
	)
	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toBe(
		`Unexpected duplicate @font-face "Inter" (font-weight: 400; font-style: normal) (${rule_name})`,
	)
	expect(warnings[0].line).toBe(3)
})

test('should error when only the src differs', async () => {
	const { warnings } = await lint(
		`
		@font-face { font-family: Inter; src: url(a.woff2); }
		@font-face { font-family: Inter; src: url(b.woff2); }
	`,
		true,
	)
	expect(warnings).toHaveLength(1)
})

test('should error when quoting and casing differ', async () => {
	const { warnings } = await lint(
		`
		@font-face { font-family: "Open Sans"; src: url(a.woff2); }
		@font-face { font-family: 'open sans'; src: url(b.woff2); }
	`,
		true,
	)
	expect(warnings).toHaveLength(1)
})

test('should treat omitted descriptors as their default values', async () => {
	const { warnings } = await lint(
		`
		@font-face { font-family: Inter; src: url(a.woff2); }
		@font-face { font-family: Inter; font-weight: normal; font-style: normal; font-stretch: normal; src: url(b.woff2); }
	`,
		true,
	)
	expect(warnings).toHaveLength(1)
})

test('should treat bold as 700', async () => {
	const { warnings } = await lint(
		`
		@font-face { font-family: Inter; font-weight: bold; src: url(a.woff2); }
		@font-face { font-family: Inter; font-weight: 700; src: url(b.woff2); }
	`,
		true,
	)
	expect(warnings).toHaveLength(1)
})

test('should error when unicode-range is identical but formatted differently', async () => {
	const { warnings } = await lint(
		`
		@font-face { font-family: Inter; unicode-range: U+0000-00FF, U+0131; src: url(a.woff2); }
		@font-face { font-family: Inter; unicode-range: u+0000-00ff,u+0131; src: url(b.woff2); }
	`,
		true,
	)
	expect(warnings).toHaveLength(1)
})

test('should error for duplicates within the same at-rule context', async () => {
	const { warnings } = await lint(
		`
		@media print {
			@font-face { font-family: Inter; src: url(a.woff2); }
			@font-face { font-family: Inter; src: url(b.woff2); }
		}
	`,
		true,
	)
	expect(warnings).toHaveLength(1)
})

test('should report every extra duplicate', async () => {
	const { warnings } = await lint(
		`
		@font-face { font-family: Inter; src: url(a.woff2); }
		@font-face { font-family: Inter; src: url(b.woff2); }
		@font-face { font-family: Inter; src: url(c.woff2); }
	`,
		true,
	)
	expect(warnings).toHaveLength(2)
})
