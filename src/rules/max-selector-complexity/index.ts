import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_selector_list } from '@projectwallace/css-parser/parse-selector'
import { get_complexity } from '@projectwallace/css-analyzer/selectors'
import { is_keyframe_rule } from '../../utils/is-keyframe-rule.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-selector-complexity'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected a selector complexity of no more than ${expected} but found ${actual}`,
})

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [Number as unknown as (v: unknown) => boolean],
		})

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption <= 1) {
			return
		}

		root.walkRules((rule) => {
			if (is_keyframe_rule(rule)) {
				return
			}
			const selector_text = rule.selector
			if (!selector_text.trim()) {
				return
			}

			parse_selector_list(selector_text).for_each((selector) => {
				const { value: complexity, start_offset, end_offset } = get_complexity(selector)
				if (complexity > primaryOption) {
					utils.report({
						message: messages.rejected(complexity, primaryOption),
						node: rule,
						index: start_offset,
						endIndex: end_offset,
						result,
						ruleName: rule_name,
					})
				}
			})
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
