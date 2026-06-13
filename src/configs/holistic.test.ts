import { test, expect } from 'vitest'
import stylelint from 'stylelint'
import plugins from '../index.js'
import config from './holistic.js'

test('holistic config runs without invalid option warnings', async () => {
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
