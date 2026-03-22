import stylelint from 'stylelint'
import { test, expect, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import plugin from './index.js'

let tmp_dir: string

function write_fixture(name: string, content: string): string {
	if (!tmp_dir) {
		tmp_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'no-unknown-cp-test-'))
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

const rule_name = 'projectwallace/no-unknown-custom-property'

test('should not error when a custom property is declared and used', async () => {
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
				--color: red;
				color: var(--color);
			}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when a custom property is used but never declared', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ line, column, text }] = warnings

	expect(text).toBe(`"--undeclared" is used in a var() but was never declared (${rule_name})`)
	expect(line).toBe(1)
	expect(column).toBe(16)
})

test('should not error when a custom property declared via @property is used', async () => {
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

test('should error when var() uses an undeclared property even if @property exists for another', async () => {
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
			@property --declared {
				syntax: '<color>';
				initial-value: red;
				inherits: false;
			}
			a { color: var(--undeclared); }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--undeclared" is used in a var() but was never declared (${rule_name})`,
	)
})

test('should error on undeclared var() with fallback when allowFallback is not set', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared, red); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--undeclared" is used in a var() but was never declared (${rule_name})`,
	)
})

test('should not error on undeclared var() with fallback when allowFallback is true', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowFallback: true }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared, red); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on undeclared var() with var() fallback when allowFallback is true', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowFallback: true }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared, var(--also-undeclared)); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--also-undeclared" is used in a var() but was never declared (${rule_name})`,
	)
})

test('should not error on undeclared var() with empty fallback when allowFallback is true', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowFallback: true }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared, ); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on undeclared property matched by allowList string', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: ['--external-color'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--external-color); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on undeclared property matched by allowList RegExp', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: [/^--external-/] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--external-color); background: var(--external-bg); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error on undeclared property not matched by allowList', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: ['--external-color'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--external-color); background: var(--undeclared); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--undeclared" is used in a var() but was never declared (${rule_name})`,
	)
})

test('ignores allowList when entries have incorrect types', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { allowList: [false] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--undeclared); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBeGreaterThanOrEqual(1)
})

test('should not error when var() uses a property declared in an importFrom file', async () => {
	const file = write_fixture('tokens.css', ':root { --token-color: red; }')
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { importFrom: [file] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--token-color); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when var() uses a property declared via @property in an importFrom file', async () => {
	const file = write_fixture(
		'tokens.css',
		`@property --token-color {
			syntax: '<color>';
			initial-value: red;
			inherits: false;
		}`,
	)
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { importFrom: [file] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--token-color); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when var() uses a property from one of multiple importFrom files', async () => {
	const colors = write_fixture('colors.css', ':root { --token-color: red; }')
	const spacing = write_fixture('spacing.css', ':root { --token-space: 8px; }')
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { importFrom: [colors, spacing] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--token-color); padding: var(--token-space); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should accept importFrom entries as { filePath } objects', async () => {
	const file = write_fixture('tokens.css', ':root { --token-color: red; }')
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { importFrom: [{ filePath: file }] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--token-color); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error when var() uses a property not present in any importFrom file', async () => {
	const file = write_fixture('tokens.css', ':root { --token-color: red; }')
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { importFrom: [file] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: var(--token-color); background: var(--not-in-tokens); }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(
		`"--not-in-tokens" is used in a var() but was never declared (${rule_name})`,
	)
})
