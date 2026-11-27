import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_definitions } from '../../utils/function-mixin.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-layer-in-mixin'

const messages = utils.ruleMessages(rule_name, {
	rejected: () => `Unexpected @layer in @mixin, its contents are dropped when the mixin is applied`,
})

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
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

		for (const definition of get_definitions(root, 'mixin')) {
			definition.node.walkAtRules(/^layer$/i, (at_rule) => {
				report(at_rule, messages.rejected())
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
