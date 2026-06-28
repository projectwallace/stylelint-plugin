import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'
import { supportsReferenceFiles, createFixtures } from '../test-utils.js'

const write_fixture = createFixtures('no-unknown-container-names-test-')

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

test.runIf(supportsReferenceFiles)(
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

test.runIf(supportsReferenceFiles)(
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
		expect(warnings[0].text).toBe(`Unexpected unknown container name "unknown" (${rule_name})`)
	},
)
