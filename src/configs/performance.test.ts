import { test, expect } from 'vitest'
import stylelint from 'stylelint'
import plugins from '../index.js'
import config from './performance.js'

test('performance config runs without invalid option warnings', async () => {
	const {
		results: [result],
	} = await stylelint.lint({
		code: 'a { color: red; }',
		config: {
			plugins,
			rules: config.rules,
		},
	})
	expect(result.invalidOptionWarnings).toHaveLength(0)
})
