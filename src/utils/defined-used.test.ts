import { describe, test, expect } from 'vitest'
import { DefinedUsed } from './defined-used'

describe('DefinedUsed', () => {
	test('unused when defined but never used', () => {
		const tracker = new DefinedUsed<string>()
		tracker.define('a', 'node-a')
		const unused = [...tracker.unused()]
		expect(unused).toStrictEqual([['a', 'node-a']])
	})

	test('not unused when defined then used', () => {
		const tracker = new DefinedUsed<string>()
		tracker.define('a', 'node-a')
		tracker.use('a')
		expect([...tracker.unused()]).toStrictEqual([])
	})

	test('not unused when used before defined', () => {
		const tracker = new DefinedUsed<string>()
		tracker.use('a')
		tracker.define('a', 'node-a')
		expect([...tracker.unused()]).toStrictEqual([])
	})

	test('unknown when used but never defined', () => {
		const tracker = new DefinedUsed<string>()
		tracker.use('a')
		expect([...tracker.unknown()]).toStrictEqual(['a'])
	})

	test('not unknown when used then defined', () => {
		const tracker = new DefinedUsed<string>()
		tracker.use('a')
		tracker.define('a', 'node-a')
		expect([...tracker.unknown()]).toStrictEqual([])
	})

	test('duplicate define is ignored', () => {
		const tracker = new DefinedUsed<string>()
		tracker.define('a', 'first')
		tracker.define('a', 'second')
		expect([...tracker.unused()]).toStrictEqual([['a', 'first']])
	})

	test('duplicate use is ignored', () => {
		const tracker = new DefinedUsed<string>()
		tracker.use('a')
		tracker.use('a')
		expect([...tracker.unknown()]).toStrictEqual(['a'])
	})

	test('defined_size counts unique names', () => {
		const tracker = new DefinedUsed<string>()
		tracker.define('a', 'node-a')
		tracker.define('b', 'node-b')
		tracker.define('a', 'node-a-again')
		expect(tracker.defined_size).toBe(2)
	})

	test('mix of unused, used, and unknown', () => {
		const tracker = new DefinedUsed<string>()
		tracker.define('defined-only', 'node-1')
		tracker.define('defined-and-used', 'node-2')
		tracker.use('defined-and-used')
		tracker.use('used-only')

		expect([...tracker.unused()]).toStrictEqual([['defined-only', 'node-1']])
		expect([...tracker.unknown()]).toStrictEqual(['used-only'])
	})
})
