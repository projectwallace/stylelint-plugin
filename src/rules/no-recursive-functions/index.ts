import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_definitions, walk_function_calls } from '../../utils/function-mixin.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-recursive-functions'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected recursive call of @function "${name}" in its own body`,
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
			definition.node.walkDecls((declaration) => {
				// A call in a conditional rule might never be evaluated, so only look at the top level
				if (declaration.parent !== definition.node) {
					return
				}
				walk_function_calls(declaration, (name) => {
					if (name === definition.name) {
						report(declaration, messages.rejected(name), { word: name })
					}
				})
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
