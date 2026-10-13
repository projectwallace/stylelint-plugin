import { describe, test, expect } from 'vitest'
import { unquote } from './unquote'

describe('unquote', () => {
	test('removes surrounding double quotes', () => {
		expect(unquote('"<color>"')).toBe('<color>')
	})

	test('removes surrounding single quotes', () => {
		expect(unquote("'<color>'")).toBe('<color>')
	})

	test('leaves unquoted string unchanged', () => {
		expect(unquote('<color>')).toBe('<color>')
	})

	test('does not remove quotes in the middle of the string', () => {
		expect(unquote('foo"bar')).toBe('foo"bar')
	})

	test('handles empty string', () => {
		expect(unquote('')).toBe('')
	})
})
