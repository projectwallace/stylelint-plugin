import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'
import { supportsReferenceFiles, createFixtures } from '../test-utils.js'

const write_fixture = createFixtures('no-unused-container-names-test-')

const rule_name = 'projectwallace/no-unused-container-names'

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

test('should not error when multiple container names are declared and used', async () => {
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
			.sidebar { container-name: sidebar test; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
			@container test (min-width: 700px) { .card { font-size: 1rem; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when a container name is declared but never used', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container-name: sidebar; }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(`Unexpected unused container name "sidebar" (${rule_name})`)
})

test('should error when a container name is declared in shorthand with multiple names but never used', async () => {
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
			.sidebar { container-name: sidebar test; }
			@container sidebar (min-width: 30rem) { .thing { color: red; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(`Unexpected unused container name "test" (${rule_name})`)
})

test('should not error when there are no container names', async () => {
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

test('should not error when container shorthand name is used', async () => {
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

test('should error when container shorthand name is never used', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container: sidebar / inline-size; }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(`Unexpected unused container name "sidebar" (${rule_name})`)
})

test('should not error when container-name is none', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container-name: none; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when container shorthand is none', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container: none; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should handle multiple container names declared on one element', async () => {
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
			.sidebar { container-name: sidebar header; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(`Unexpected unused container name "header" (${rule_name})`)
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
		code: `
			.sidebar { container-name: sidebar; }
			@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }
			@container (min-width: 400px) { .other { color: red; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when ignore string matches unused container name', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { ignore: ['sidebar'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container-name: sidebar; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when ignore RegExp matches unused container name', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { ignore: [/^side/] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container-name: sidebar; }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error when ignore does not match the unused container name', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [true, { ignore: ['header'] }],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: '.sidebar { container-name: sidebar; }',
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)
	expect(warnings[0].text).toBe(`Unexpected unused container name "sidebar" (${rule_name})`)
})

test.runIf(supportsReferenceFiles)(
	'should not error when container name is declared but queried in a referenceFiles file',
	async () => {
		const file = write_fixture(
			'component.css',
			'@container sidebar (min-width: 700px) { .card { font-size: 1rem; } }',
		)
		const {
			results: [{ warnings, errored }],
		} = await stylelint.lint({
			code: '.sidebar { container-name: sidebar; }',
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
	'should still error when container name is declared and not queried anywhere including referenceFiles',
	async () => {
		const file = write_fixture(
			'component.css',
			'@container other (min-width: 700px) { .card { font-size: 1rem; } }',
		)
		const {
			results: [{ warnings, errored }],
		} = await stylelint.lint({
			code: '.sidebar { container-name: sidebar; }',
			config: {
				plugins: [plugin],
				rules: { [rule_name]: true },
				referenceFiles: [file],
			},
		})
		expect(errored).toBe(true)
		expect(warnings.length).toBe(1)
		expect(warnings[0].text).toBe(`Unexpected unused container name "sidebar" (${rule_name})`)
	},
)
