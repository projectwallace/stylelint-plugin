import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_definitions } from '../../utils/function-mixin.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/require-function-result'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Expected @function "${name}" to have a result descriptor`,
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

		for (const definition of get_definitions(root, 'function')) {
			let has_result = false
			definition.node.walkDecls(/^result$/i, () => {
				has_result = true
				return false
			})
			if (!has_result) {
				report(definition.node, messages.rejected(definition.name), { word: definition.name })
			}
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
