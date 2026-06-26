import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_selector_list } from '@projectwallace/css-parser/parse-selector'
import { getComplexity } from '@projectwallace/css-analyzer/selectors'
import { is_keyframe_rule } from '../../utils/is-keyframe-rule.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-selector-complexity'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected a selector complexity of no more than ${expected} but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-selector-complexity/README.md',
}

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
			if (is_keyframe_rule(rule)) return
			const selector_text = rule.selector
			if (!selector_text.trim()) return

			const selector_list = parse_selector_list(selector_text)

			for (const selector of selector_list) {
				const complexity = getComplexity(selector)

				if (complexity > primaryOption) {
					utils.report({
						message: messages.rejected(complexity, primaryOption),
						node: rule,
						index: selector.start,
						endIndex: selector.end,
						result,
						ruleName: rule_name,
					})
				}
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
