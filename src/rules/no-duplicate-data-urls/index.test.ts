import stylelint from 'stylelint'
import { test, expect } from 'vitest'
import plugin from './index.js'

const rule_name = 'projectwallace/no-duplicate-data-urls'

const config = {
	plugins: [plugin],
	rules: {
		[rule_name]: true,
	},
}

test('should not error when there are no data URLs', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { background: url(image.png); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when a data URL is used only once', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: 'a { background: url("data:image/png;base64,abc123"); }',
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should error when the same data URL is used more than once', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `thing {
  -webkit-mask-image: url(data:image/svg+xml,%3Csvg%3E%3C/svg%3E);
  mask-image: url(data:image/svg+xml,%3Csvg%3E%3C/svg%3E);
}`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(1)
	expect(warnings[0].text).toContain(
		`Duplicate data URL found. Store it in a custom property and use var() to reuse it. (${rule_name})`,
	)
})

test('should report each additional duplicate', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { background: url("data:image/png;base64,abc"); }
b { background: url("data:image/png;base64,abc"); }
c { background: url("data:image/png;base64,abc"); }`,
		config,
	})

	expect(errored).toBe(true)
	expect(warnings).toHaveLength(2)
})

test('should not error when different data URLs are used', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { background: url("data:image/png;base64,abc123"); }
b { background: url("data:image/png;base64,xyz789"); }`,
		config,
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should not error when rule is disabled', async () => {
	const {
		results: [{ warnings, errored }],
	} = await stylelint.lint({
		code: `a { background: url("data:image/png;base64,abc"); }
b { background: url("data:image/png;base64,abc"); }`,
		config: {
			plugins: [plugin],
			rules: {
				[rule_name]: null,
			},
		},
	})

	expect(errored).toBe(false)
	expect(warnings).toStrictEqual([])
})

test('should report the correct line for a duplicate', async () => {
	const {
		results: [{ warnings }],
	} = await stylelint.lint({
		code: `a { background: url("data:image/png;base64,abc"); }
b { background: url("data:image/png;base64,abc"); }`,
		config,
	})

	expect(warnings[0].line).toBe(2)
})
