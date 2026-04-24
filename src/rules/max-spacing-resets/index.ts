import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { isValueReset } from '@projectwallace/css-analyzer/values'
import { parse_value } from '@projectwallace/css-parser/parse-value'

const { createPlugin, utils } = stylelint

export const rule_name = 'projectwallace/max-spacing-resets'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Found ${actual} spacing resets which exceeds the maximum of ${expected}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-spacing-resets/README.md',
}

const SPACING_RESET_PROPERTIES =
	/^(?:margin|padding)(?:-(?:block|inline|top|right|bottom|left)(?:-(?:start|end))?)?$/i

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [(v: unknown) => typeof v === 'number'],
		})

		if (!validOptions || !Number.isInteger(primaryOption) || primaryOption < 0) {
			return
		}

		// TODO: at some point we could have a setting to ignore resets in a reset/normalize layer,
		// e.g. `ignoreLayers: ['reset', 'normalize']`
		// Then any reset in `@layer reset {}` would be ignored.
		let reset_count = 0
		const violating_declarations: Declaration[] = []

		root.walkDecls(SPACING_RESET_PROPERTIES, (declaration) => {
			if (!isValueReset(parse_value(declaration.value))) return

			reset_count++
			if (reset_count > primaryOption) {
				violating_declarations.push(declaration)
			}
		})

		for (const declaration of violating_declarations) {
			utils.report({
				message: messages.rejected(reset_count, primaryOption),
				node: declaration,
				result,
				ruleName: rule_name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
