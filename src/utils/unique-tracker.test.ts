import { describe, test, expect } from 'vitest'
import { UniqueTracker } from './unique-tracker.js'

describe('UniqueTracker', () => {
	test('tracks size and membership', () => {
		const t = new UniqueTracker(10)
		t.add('a')
		t.add('a')
		t.add('b')
		expect(t.size).toBe(2)
		expect(t.has('a')).toBe(true)
		expect(t.has('c')).toBe(false)
	})

	test('add() only reports a trigger for new values above the limit', () => {
		const t = new UniqueTracker(2)
		expect(t.add('a')).toBe(false)
		expect(t.add('b')).toBe(false)
		expect(t.add('c')).toBe(true)
		// duplicates never trigger, even above the limit
		expect(t.add('c')).toBe(false)
		expect(t.add('a')).toBe(false)
		// every further new value triggers
		expect(t.add('d')).toBe(true)
	})

	test('limit of 0 triggers on the first value', () => {
		const t = new UniqueTracker(0)
		expect(t.add('a')).toBe(true)
	})

	test('exceeded() is false when under the limit', () => {
		const t = new UniqueTracker(2)
		t.begin()
		t.add('a')
		t.add('b')
		expect(t.exceeded()).toBe(false)
	})

	test('exceeded() is true when a node pushes the total over the limit', () => {
		const t = new UniqueTracker(1)
		t.begin()
		t.add('a')
		expect(t.exceeded()).toBe(false)
		t.begin()
		t.add('b')
		expect(t.exceeded()).toBe(true)
	})

	test('exceeded() is false for a node that only adds duplicates', () => {
		const t = new UniqueTracker(1)
		t.begin()
		t.add('a')
		t.begin()
		t.add('b')
		t.begin()
		t.add('a')
		t.add('b')
		expect(t.exceeded()).toBe(false)
	})

	test('exceeded() is false for a node that adds nothing', () => {
		const t = new UniqueTracker(0)
		t.begin()
		expect(t.exceeded()).toBe(false)
	})
})
