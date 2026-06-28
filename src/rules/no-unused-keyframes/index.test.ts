import stylelint from 'stylelint'
import { createRequire } from 'node:module'
import { test, expect, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import plugin from './index.js'

const _require = createRequire(import.meta.url)
const _stylelintVersion: string = (_require('stylelint/package.json') as { version: string }).version
const [major, minor] = _stylelintVersion.split('.').map(Number)
const supportsReferenceFiles = major > 17 || (major === 17 && minor >= 9)

let tmp_dir: string

function write_fixture(name: string, content: string): string {
	if (!tmp_dir) {
		tmp_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'no-unused-keyframes-test-'))
	}
	const file_path = path.join(tmp_dir, name)
	fs.writeFileSync(file_path, content, 'utf8')
	return file_path
}

afterEach(() => {
	if (tmp_dir) {
		fs.rmSync(tmp_dir, { recursive: true, force: true })
		tmp_dir = undefined!
	}
})

const rule_name = 'projectwallace/no-unused-keyframes'

async function lint(code: string, primaryOption: unknown, secondaryOptions?: unknown) {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]:
				secondaryOptions !== undefined ? [primaryOption, secondaryOptions] : primaryOption,
		},
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

test('should not error when keyframe is used in animation-name', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		a { animation-name: slide-in; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when quoted keyframe name is used in animation-name', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes "slide in" { from { opacity: 0; } to { opacity: 1; } }
		a { animation-name: "slide in"; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when quoted keyframe name is used in animation shorthand', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes "slide in" { from { opacity: 0; } to { opacity: 1; } }
		a { animation: "slide in" 1s ease; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when quoted keyframe name is never used', async () => {
	const { warnings, errored } = await lint(
		'@keyframes "slide in" { from { opacity: 0; } to { opacity: 1; } }',
		true,
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(`Unexpected unused keyframe ""slide in"" (${rule_name})`)
})

test('should not error when keyframe is used in animation shorthand', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		a { animation: slide-in 1s ease; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple keyframes are all used', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
		a { animation-name: slide-in, fade-out; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when multiple keyframes are used in multiple animation shorthands', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
		a { animation: slide-in 1s, fade-out 2s; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when there are no keyframes', async () => {
	const { warnings, errored } = await lint('a { color: red; }', true)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when animation-name is none', async () => {
	const { warnings, errored } = await lint(
		`
		a { animation-name: none; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when animation shorthand with only keyword values uses no keyframe name', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		a { animation: slide-in 1s ease forwards running; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when keyframe is used via animation shorthand with direction keywords', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } }
		a { animation: pulse 2s ease-in-out infinite alternate; }
	`,
		true,
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when ignore string matches unused keyframe name', async () => {
	const { warnings, errored } = await lint(
		'@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }',
		true,
		{ ignore: ['slide-in'] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when ignore RegExp matches unused keyframe name', async () => {
	const { warnings, errored } = await lint(
		'@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }',
		true,
		{ ignore: [/^slide/] },
	)
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

// ---------------------------------------------------------------------------
// Violation
// ---------------------------------------------------------------------------

test('should error when a keyframe is declared but never used', async () => {
	const { warnings, errored } = await lint(
		'@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }',
		true,
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(`Unexpected unused keyframe "slide-in" (${rule_name})`)
})

test('should mark the whole atrule node, not just the keyframe name', async () => {
	const { warnings } = await lint(
		'@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } } test {}',
		true,
	)
	// column 1 = start of `@keyframes`; if `word` were set to the name,
	// column would point to `slide-in` (column 12) instead
	expect(warnings[0].column).toBe(1)
	expect(warnings[0].endColumn).toBe(64)
})

test('should error when one of multiple keyframes is unused', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		@keyframes fade-out { from { opacity: 1; } to { opacity: 0; } }
		a { animation-name: slide-in; }
	`,
		true,
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(`Unexpected unused keyframe "fade-out" (${rule_name})`)
})

test('should error when animation-name is none and keyframe exists', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		a { animation-name: none; }
	`,
		true,
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

test('should error when animation shorthand has no name and keyframe exists', async () => {
	const { warnings, errored } = await lint(
		`
		@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }
		a { animation: 1s ease forwards; }
	`,
		true,
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
})

test('should still error when ignore does not match the unused keyframe name', async () => {
	const { warnings, errored } = await lint(
		'@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }',
		true,
		{ ignore: ['other-animation'] },
	)
	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(`Unexpected unused keyframe "slide-in" (${rule_name})`)
})

test.skipIf(!supportsReferenceFiles)(
	'should not error when keyframe is declared but used via animation-name in a referenceFiles file',
	async () => {
		const file = write_fixture(
			'component.css',
			'a { animation-name: slide-in; }',
		)
		const {
			results: [{ warnings, errored }],
		} = await stylelint.lint({
			code: '@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }',
			config: {
				plugins: [plugin],
				rules: { [rule_name]: true },
				referenceFiles: [file],
			},
		})
		expect(errored).toBe(false)
		expect(warnings).toStrictEqual([])
	},
)

test.skipIf(!supportsReferenceFiles)(
	'should not error when keyframe is declared but used via animation shorthand in a referenceFiles file',
	async () => {
		const file = write_fixture(
			'component.css',
			'a { animation: slide-in 1s linear; }',
		)
		const {
			results: [{ warnings, errored }],
		} = await stylelint.lint({
			code: '@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }',
			config: {
				plugins: [plugin],
				rules: { [rule_name]: true },
				referenceFiles: [file],
			},
		})
		expect(errored).toBe(false)
		expect(warnings).toStrictEqual([])
	},
)

test.skipIf(!supportsReferenceFiles)(
	'should still error when keyframe is declared and not used anywhere including referenceFiles',
	async () => {
		const file = write_fixture('component.css', 'a { animation-name: other; }')
		const {
			results: [{ warnings, errored }],
		} = await stylelint.lint({
			code: '@keyframes slide-in { from { opacity: 0; } to { opacity: 1; } }',
			config: {
				plugins: [plugin],
				rules: { [rule_name]: true },
				referenceFiles: [file],
			},
		})
		expect(errored).toBe(true)
		expect(warnings.length).toBe(1)
		expect(warnings[0].text).toBe(`Unexpected unused keyframe "slide-in" (${rule_name})`)
	},
)
