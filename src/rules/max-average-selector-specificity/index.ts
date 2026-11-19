import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { parse_selector_list } from '@projectwallace/css-parser/parse-selector'
import {
	get_specificity,
	compare_specificity,
	type Specificity,
} from '@projectwallace/css-analyzer/selectors'
import { is_keyframe_rule } from '../../utils/is-keyframe-rule.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-average-selector-specificity'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: string, expected: string) =>
		`Expected average specificity of no more than [${expected}] but found [${actual}]`,
})

function is_valid_specificity(v: unknown): boolean {
	return (
		Array.isArray(v) &&
		v.length === 3 &&
		v.every((n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= 0)
	)
}

const ruleFunction = (primaryOption: Specificity) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: is_valid_specificity,
		})

		if (!validOptions || !is_valid_specificity(primaryOption)) {
			return
		}

		const sum: Specificity = [0, 0, 0]
		let selector_count = 0

		root.walkRules((rule) => {
			if (is_keyframe_rule(rule)) {
				return
			}
			const specificities = get_specificity(parse_selector_list(rule.selector))
			for (const specificity of specificities) {
				sum[0] += specificity[0]
				sum[1] += specificity[1]
				sum[2] += specificity[2]
				selector_count++
			}
		})

		if (selector_count === 0) {
			return
		}

		const average: Specificity = [
			sum[0] / selector_count,
			sum[1] / selector_count,
			sum[2] / selector_count,
		]

		// compare_specificity returns < 0 when first arg has higher specificity than second
		if (compare_specificity(average, primaryOption) > 0) {
			utils.report({
				message: messages.rejected(average.join(', '), primaryOption.join(', ')),
				node: root,
				result,
				ruleName: rule_name,
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages, {
	primaryOptionArray: true,
})

export default plugin
