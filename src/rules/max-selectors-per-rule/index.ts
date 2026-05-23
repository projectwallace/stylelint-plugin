import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_selector_list } from '@projectwallace/css-parser/parse-selector'
import { is_valid_positive_integer } from '../../utils/option-validators.js'
import { is_keyframe_rule } from '../../utils/is-keyframe-rule.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-selectors-per-rule'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Selectors per rule is ${actual} which is greater than the allowed ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-selectors-per-rule/README.md',
}

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_positive_integer],
		})

		if (!validOptions) return

		root.walkRules((rule) => {
			if (is_keyframe_rule(rule)) return
			const parsed = parse_selector_list(rule.selector)
			const actual = parsed.child_count

			if (actual > primaryOption) {
				utils.report({
					message: messages.rejected(actual, primaryOption),
					node: rule,
					result,
					ruleName: rule_name,
				})
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
