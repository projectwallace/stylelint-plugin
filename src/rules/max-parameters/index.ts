import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_definitions } from '../../utils/function-mixin.js'
import { is_valid_positive_integer } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/max-parameters'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string, actual: number, expected: number) =>
		`Expected no more than ${expected} parameters for ${name} but found ${actual}`,
})

const ruleFunction = (primaryOption: number) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [is_valid_positive_integer],
		})

		if (!validOptions) {
			return
		}

		const report = (
			node: Parameters<typeof utils.report>[0]['node'],
			message: string,
			location: { word?: string; index?: number; endIndex?: number } = {},
		) => utils.report({ result, ruleName: rule_name, message, node, ...location })

		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions

		for (const definition of get_definitions(root)) {
			if (definition.params.length > primaryOption) {
				report(
					definition.node,
					messages.rejected(
						`@${definition.kind} ${definition.name}`,
						definition.params.length,
						primaryOption,
					),
					{ word: definition.name },
				)
			}
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
