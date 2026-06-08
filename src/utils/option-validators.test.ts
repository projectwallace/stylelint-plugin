import { describe, test, expect } from 'vitest'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_positive_integer,
	is_valid_non_negative_integer,
	is_valid_ratio,
} from './option-validators'

describe('is_allowed', () => {
	test('exact string match', () => {
		expect(is_allowed('border', ['border'])).toBe(true)
	})

	test('exact string does not over-match', () => {
		expect(is_allowed('border-color', ['border'])).toBe(false)
	})

	test('RegExp match', () => {
		expect(is_allowed('border-color', [/^border/])).toBe(true)
	})

	test('RegExp no match', () => {
		expect(is_allowed('outline', [/^border/])).toBe(false)
	})

	test('string-encoded regex match', () => {
		expect(is_allowed('border-color', ['/^border/'])).toBe(true)
	})

	test('string-encoded regex no match', () => {
		expect(is_allowed('outline', ['/^border/'])).toBe(false)
	})

	test('string-encoded regex with i flag', () => {
		expect(is_allowed('border-color', ['/^Border/i'])).toBe(true)
	})

	test('string-encoded regex without i flag is case-sensitive', () => {
		expect(is_allowed('border-color', ['/^Border/'])).toBe(false)
	})

	test('mixed allow list', () => {
		expect(is_allowed('outline', ['single-value', '/^border/', 'outline', 'text-decoration'])).toBe(
			true,
		)
		expect(
			is_allowed('border-radius', ['single-value', '/^border/', 'outline', 'text-decoration']),
		).toBe(true)
		expect(
			is_allowed('background', ['single-value', '/^border/', 'outline', 'text-decoration']),
		).toBe(false)
	})
})

describe('ignore_option_validators', () => {
	test('accepts strings', () => {
		expect(ignore_option_validators.some((v) => v('hello'))).toBe(true)
	})

	test('accepts RegExp instances', () => {
		expect(ignore_option_validators.some((v) => v(/^border/))).toBe(true)
	})
})

describe('is_valid_positive_integer', () => {
	test('positive integers are valid', () => {
		expect(is_valid_positive_integer(1)).toBe(true)
		expect(is_valid_positive_integer(100)).toBe(true)
	})

	test('zero is not valid', () => {
		expect(is_valid_positive_integer(0)).toBe(false)
	})

	test('negative integers are not valid', () => {
		expect(is_valid_positive_integer(-1)).toBe(false)
	})

	test('floats are not valid', () => {
		expect(is_valid_positive_integer(1.5)).toBe(false)
	})

	test('strings are not valid', () => {
		expect(is_valid_positive_integer('1')).toBe(false)
	})
})

describe('is_valid_non_negative_integer', () => {
	test('zero is valid', () => {
		expect(is_valid_non_negative_integer(0)).toBe(true)
	})

	test('positive integers are valid', () => {
		expect(is_valid_non_negative_integer(1)).toBe(true)
		expect(is_valid_non_negative_integer(100)).toBe(true)
	})

	test('negative integers are not valid', () => {
		expect(is_valid_non_negative_integer(-1)).toBe(false)
	})

	test('floats are not valid', () => {
		expect(is_valid_non_negative_integer(1.5)).toBe(false)
	})
})

describe('is_valid_ratio', () => {
	test('0 is valid', () => {
		expect(is_valid_ratio(0)).toBe(true)
	})

	test('1 is valid', () => {
		expect(is_valid_ratio(1)).toBe(true)
	})

	test('values between 0 and 1 are valid', () => {
		expect(is_valid_ratio(0.5)).toBe(true)
	})

	test('values above 1 are not valid', () => {
		expect(is_valid_ratio(1.1)).toBe(false)
	})

	test('negative values are not valid', () => {
		expect(is_valid_ratio(-0.1)).toBe(false)
	})

	test('non-finite values are not valid', () => {
		expect(is_valid_ratio(Infinity)).toBe(false)
		expect(is_valid_ratio(NaN)).toBe(false)
	})
})
