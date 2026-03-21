import stylelint from 'stylelint'
import { test, expect, beforeEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import plugin, { accumulator } from './index.js'

const rule_name = 'projectwallace/max-lines-of-code'

// Reset cross-file state before each test so runs don't bleed into each other.
beforeEach(() => {
	accumulator.reset()
})

// ---------------------------------------------------------------------------
// Per-file behavior (inline code — no file path)
// ---------------------------------------------------------------------------

test('should not run when config is set to a value lower than 0', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: -1,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on a very simple stylesheet with max-lines=2', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a {}`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when lines of code exceeds allowed setting', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: 2,
		},
	}

	const code = `
		a {
			color: green;
		}

		a {
			color: red;
		}
	`

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0]).toMatchObject({
		line: 1,
		column: 1,
		endLine: 9,
		endColumn: 3,
		rule: rule_name,
		severity: 'error',
		text: 'Counted 4 Lines of Code which is greater than the allowed 2 (projectwallace/max-lines-of-code)',
	})
})

// ---------------------------------------------------------------------------
// Cross-file behavior (actual files on disk)
// ---------------------------------------------------------------------------

test('should not error when total SLOC across multiple files is within the limit', async () => {
	const dir = mkdtempSync(join(tmpdir(), 'stylelint-mloc-'))
	try {
		writeFileSync(join(dir, 'a.css'), 'a { color: red; }\n')
		writeFileSync(join(dir, 'b.css'), 'b { color: blue; }\n')

		const { results } = await stylelint.lint({
			files: [join(dir, '*.css')],
			config: {
				plugins: [plugin],
				rules: { [rule_name]: 10 },
			},
		})

		const allWarnings = results.flatMap((r) => r.warnings)
		expect(allWarnings).toStrictEqual([])
	} finally {
		rmSync(dir, { recursive: true })
	}
})

test('should error on the file that pushes the total SLOC over the limit', async () => {
	const dir = mkdtempSync(join(tmpdir(), 'stylelint-mloc-'))
	try {
		// Each file has 1 SLOC; together they exceed a limit of 1.
		writeFileSync(join(dir, 'a.css'), 'a { color: red; }\n')
		writeFileSync(join(dir, 'b.css'), 'b { color: blue; }\n')

		const { results } = await stylelint.lint({
			files: [join(dir, '*.css')],
			config: {
				plugins: [plugin],
				rules: { [rule_name]: 1 },
			},
		})

		const allWarnings = results.flatMap((r) => r.warnings)
		expect(allWarnings).toHaveLength(1)
		expect(allWarnings[0]).toMatchObject({
			rule: rule_name,
			severity: 'error',
			text: 'Counted 2 Lines of Code which is greater than the allowed 1 (projectwallace/max-lines-of-code)',
		})
	} finally {
		rmSync(dir, { recursive: true })
	}
})

test('should accumulate SLOC from many files and only report once', async () => {
	const dir = mkdtempSync(join(tmpdir(), 'stylelint-mloc-'))
	try {
		// 3 files × 1 SLOC each = 3 total; limit is 2.
		writeFileSync(join(dir, 'a.css'), 'a { color: red; }\n')
		writeFileSync(join(dir, 'b.css'), 'b { color: blue; }\n')
		writeFileSync(join(dir, 'c.css'), 'c { color: green; }\n')

		const { results } = await stylelint.lint({
			files: [join(dir, '*.css')],
			config: {
				plugins: [plugin],
				rules: { [rule_name]: 2 },
			},
		})

		const allWarnings = results.flatMap((r) => r.warnings)
		expect(allWarnings).toHaveLength(1)
		expect(allWarnings[0].text).toContain('Lines of Code which is greater than the allowed 2')
	} finally {
		rmSync(dir, { recursive: true })
	}
})
