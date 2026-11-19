import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { is_spacing_reset_property } from '@projectwallace/css-analyzer/properties'
import { is_value_reset } from '@projectwallace/css-analyzer/values'
import { parse_value_of } from '../../utils/parse.js'
import { is_valid_non_negative_integer } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

export const rule_name = 'projectwallace/max-spacing-resets'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} spacing resets but found ${actual}`,
})

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_non_negative_integer],
		})

		if (!validOptions) {
			return
		}

		// At some point we could have a setting to ignore resets in a reset/normalize layer,
		// e.g. `ignoreLayers: ['reset', 'normalize']`
		// Then any reset in `@layer reset {}` would be ignored.
		let reset_count = 0
		const violating_declarations: Declaration[] = []

		root.walkDecls((declaration) => {
			if (!is_spacing_reset_property(declaration.prop)) {
				return
			}
			if (!is_value_reset(parse_value_of(declaration))) {
				return
			}

			reset_count++
			if (reset_count > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(reset_count, primaryOption),
				node: declaration,
				word: declaration.value,
				result,
				ruleName: rule_name,
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
