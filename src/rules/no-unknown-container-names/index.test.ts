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
		tmp_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'no-unknown-container-names-test-'))
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

const rule_name = 'projectwallace/no-unknown-container-names'

test('should not error when a container name is declared and used', async () => {
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
			.sidebar { container-name: sidebar; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when a container name is used in @container but never declared', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(`Unexpected unknown container name "sidebar" (${rule_name})`)
})

test('should not error when there are no @container queries', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { color: red; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when container shorthand name is declared and used', async () => {
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
			.sidebar { container: sidebar / inline-size; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when container shorthand with multiple names is declared and used', async () => {
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
			.sidebar { container: sidebar test / inline-size; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
			@container test (min-width: 700px) { .card { font-size: 1rem; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on anonymous @container queries', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on @container with negated query', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container not (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on @container with style query', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container style(--responsive: true) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on @container with and query', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container and (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on @container with or query', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container or (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on @container with scroll-state query', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container scroll-state(scrollable: right) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on unknown name matched by ignore string', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { ignore: ['sidebar'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error on unknown name matched by ignore RegExp', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { ignore: [/^side/] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error when ignore does not match the unknown container name', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { ignore: ['header'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(`Unexpected unknown container name "sidebar" (${rule_name})`)
})

test('should handle multiple @container queries referencing the same unknown name once', async () => {
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
			@container sidebar (min-width: 700px) { .a { color: red; } }
			@container sidebar (min-width: 1000px) { .b { color: blue; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(2)
})

test('should error for each unique unknown container name', async () => {
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
			@container sidebar (min-width: 700px) { .a { color: red; } }
			@container header (min-width: 700px) { .b { color: blue; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(2)
})

test.skipIf(!supportsReferenceFiles)(
	'should not error when @container uses a name declared in a referenceFiles file',
	async () => {
		const file = write_fixture('layout.css', '.sidebar { container-name: sidebar; }')
		const {
			results: [{ warnings, errored }],
		} = await stylelint.lint({
			code: '@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }',
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
	'should still error when @container uses a name not in any referenceFiles file',
	async () => {
		const file = write_fixture('layout.css', '.sidebar { container-name: sidebar; }')
		const {
			results: [{ warnings, errored }],
		} = await stylelint.lint({
			code: '@container unknown (min-width: 700px) { .card { font-size: 1rem; } }',
			config: {
				plugins: [plugin],
				rules: { [rule_name]: true },
				referenceFiles: [file],
			},
		})
		expect(errored).toBe(true)
		expect(warnings.length).toBe(1)
		expect(warnings[0].text).toBe(
			`Unexpected unknown container name "unknown" (${rule_name})`,
		)
	},
)
