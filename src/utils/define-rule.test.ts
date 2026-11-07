import { describe, test, expect } from 'vitest'
import { define_rule as define_rule_typed, get_rule_url } from './define-rule.js'

type Registered = { ruleName: string; rule: any }
const define_rule = (...args: Parameters<typeof define_rule_typed>) =>
	define_rule_typed(...args) as unknown as Registered

describe('get_rule_url', () => {
	test('strips the projectwallace/ prefix', () => {
		expect(get_rule_url('projectwallace/max-selectors')).toBe(
			'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-selectors/README.md',
		)
	})
	test('accepts an unprefixed name', () => {
		expect(get_rule_url('max-selectors')).toContain('/src/rules/max-selectors/README.md')
	})
})

describe('define_rule', () => {
	const messages = { rejected: () => 'nope' }

	test('attaches ruleName, messages and meta to the rule function', () => {
		const fn = () => () => {}
		const plugin = define_rule('projectwallace/test-rule', fn, messages)
		expect(plugin.ruleName).toBe('projectwallace/test-rule')
		expect(plugin.rule).toBe(fn)
		expect(plugin.rule.ruleName).toBe('projectwallace/test-rule')
		expect(plugin.rule.messages).toBe(messages)
		expect(plugin.rule.meta).toEqual({ url: get_rule_url('projectwallace/test-rule') })
		expect(plugin.rule.primaryOptionArray).toBeUndefined()
	})

	test('sets primaryOptionArray only when requested', () => {
		const plugin = define_rule('projectwallace/test-rule', () => () => {}, messages, {
			primaryOptionArray: true,
		})
		expect(plugin.rule.primaryOptionArray).toBe(true)
	})
})
