import stylelint from 'stylelint'
import { test, expect, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parse } from 'postcss'
import plugin from './index.js'

let tmp_dir: string

function write_fixture(name: string, content: string): string {
	if (!tmp_dir) {
		tmp_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'no-unused-cp-test-'))
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

const rule_name = 'projectwallace/no-unused-custom-properties'

test('should not error when vars are declared in one selector and used in another', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			nav {
				--py: 0.35rem;
				--px: var(--space-3);
			}
			.compact {
				padding: var(--py) var(--px);
			}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on a single used custom property', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			a {
				--used: 1;
				color: var(--used);
			}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on when a custom property is used in a fallback var()', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			a {
				--used-in-fallback: 1;
				color: var(--not-defined, var(--used-in-fallback));
			}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error on a single unused custom property', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { --unused: 1 }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ line, column, text }] = warnings

	expect(text).toBe(`"--unused" was declared but never used in a var() (${rule_name})`)
	expect(line).toBe(1)
	expect(column).toBe(5)
})

test('should not error on when an unused custom property is allowed in options.ignoreProperties (string)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					ignoreProperties: ['--ignored'],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { --ignored: 1 }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on when an unused custom property is allowed in options.ignoreProperties (RegExp)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					ignoreProperties: [/regex/],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { --regexp-ingored: 1 }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when a custom property declared via @property is used in a var()', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@property --my-color {
				syntax: '<color>';
				initial-value: red;
				inherits: false;
			}
			a { color: var(--my-color); }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when a custom property declared via @property is never used', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@property --unused-color {
				syntax: '<color>';
				initial-value: red;
				inherits: false;
			}`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--unused-color" was declared but never used in a var() (${rule_name})`,
	)
})

test('ignores options when options.ignoreProperties types are incorrect', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					ignoreProperties: [false],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { --unused: 1 }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ line, column, text }] = warnings

	expect(text).toBe(`"--unused" was declared but never used in a var() (${rule_name})`)
	expect(line).toBe(1)
	expect(column).toBe(5)
})

test('should not error when a declared property is used in an importFrom file', async () => {
	const file = write_fixture('component.css', 'a { color: var(--color); }')
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { importFrom: [file] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: red; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when a declared property is used across multiple importFrom files', async () => {
	const file1 = write_fixture('a.css', 'a { color: var(--color); }')
	const file2 = write_fixture('b.css', 'b { background: var(--bg); }')
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { importFrom: [file1, file2] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: red; --bg: white; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should accept importFrom entries as { filePath } objects', async () => {
	const file = write_fixture('component.css', 'a { color: var(--color); }')
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { importFrom: [{ filePath: file }] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: red; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error when a declared property is not used in the current file or any importFrom file', async () => {
	const file = write_fixture('component.css', 'a { color: var(--color); }')
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { importFrom: [file] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: ':root { --color: red; --never-used: blue; }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--never-used" was declared but never used in a var() (${rule_name})`,
	)
})

test('should still detect unused custom property when input.css offsets do not match (Svelte embedded CSS)', async () => {
	const css = ':root { --unused: red; }'
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}
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
	expect(warnings[0].text).toBe(`"--unused" was declared but never used in a var() (${rule_name})`)
})
