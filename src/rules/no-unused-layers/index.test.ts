import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin, { rule_name } from './index.js'
import { supportsReferenceFiles, createFixtures } from '../test-utils.js'

const write_fixture = createFixtures('no-unused-layers-test-')

test('should not error when a declared layer is defined in a block', async () => {
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
			@layer utilities;
			@layer utilities { .u-flex { display: flex; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when a layer in an ordering list is also defined', async () => {
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
			@layer reset, utilities;
			@layer reset { * { margin: 0; } }
			@layer utilities { .u-flex { display: flex; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when there are only layer block definitions (no ordering statements)', async () => {
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
			@layer reset { * { margin: 0; } }
			@layer utilities { .u-flex { display: flex; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when a layer in an ordering list is never used', async () => {
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
			@layer reset, utilities;
			@layer reset { * { margin: 0; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toBe(`Unexpected unused layer "utilities" (${rule_name})`)
})

test('should error when a single-name layer statement is never used', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `@layer utilities;`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(1)

	const [{ text }] = warnings
	expect(text).toBe(`Unexpected unused layer "utilities" (${rule_name})`)
})

test('should error for each unused layer in a list', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `@layer reset, utilities, theme;`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(3)
})

test('should not error when an unused layer is in the ignore (string)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					ignore: ['utilities'],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@layer reset, utilities;
			@layer reset { * { margin: 0; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when an unused layer matches the ignore (RegExp)', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					ignore: [/^vendor-/],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@layer reset, vendor-reset;
			@layer reset { * { margin: 0; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should still error for layers not in the ignore when ignore is set', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [
				true,
				{
					ignore: ['utilities'],
				},
			],
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `
			@layer reset, utilities, theme;
			@layer utilities { .u-flex { display: flex; } }
		`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings.length).toBe(2)
})

test('should not error when a declared layer is used via a sublayer block rule', async () => {
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
			@layer core;
			@layer core.reset { * { margin: 0; } }
		`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when a declared layer only has sublayer ordering statements (no block or @import usage)', async () => {
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
			@layer core;
			@layer core.reset, core.tokens;
		`,
		config,
	})

	// core, core.reset, core.tokens are all declared but never used
	expect(errored).toBe(true)
	expect(warnings.length).toBe(3)
})

test('should not error when a declared layer is used via @import layer()', async () => {
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
			@layer core, core.reset;
			@import url('reset.css') layer(core.reset);
		`,
		config,
	})

	// @import layer(core.reset) counts as usage of both core.reset and core
	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not run when primary option is invalid', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: [2],
		},
	}

	const {
		results: [{ warnings, invalidOptionWarnings }],
	} = await stylelint.lint({
		code: `@layer utilities;`,
		config,
	})

	expect(warnings).toStrictEqual([])
	expect(invalidOptionWarnings.length).toBeGreaterThan(0)
})

test('should not error when no layer statements exist', async () => {
	const config = {
		plugins: [plugin],
		rules: {
			[rule_name]: true,
		},
	}

	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { color: red; }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test.runIf(supportsReferenceFiles)(
	'should not error when layer is declared but used as a block layer in a referenceFiles file',
	async () => {
		const file = write_fixture('utilities.css', '@layer utilities { .u-flex { display: flex; } }')
		const {
			results: [{ warnings, errored }],
		} = await stylelint.lint({
			code: '@layer utilities;',
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
	'should still error when layer is declared and not used anywhere including referenceFiles',
	async () => {
		const file = write_fixture('utilities.css', '@layer other { .u-flex { display: flex; } }')
		const {
			results: [{ warnings, errored }],
		} = await stylelint.lint({
			code: '@layer utilities;',
			config: {
				plugins: [plugin],
				rules: { [rule_name]: true },
				referenceFiles: [file],
			},
		})
		expect(errored).toBe(true)
		expect(warnings.length).toBe(1)
		expect(warnings[0].text).toBe(`Unexpected unused layer "utilities" (${rule_name})`)
	},
)
