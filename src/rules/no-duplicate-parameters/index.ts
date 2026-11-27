import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	get_definition,
	get_definitions,
	get_apply,
	collect_var_names,
	walk_function_calls,
} from '../../utils/function-mixin.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-parameters'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string, owner: string) => `Unexpected duplicate parameter "${name}" of ${owner}`,
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

		for (const definition of get_definitions(root)) {
			const seen = new Set<string>()
			for (const parameter of definition.params) {
				if (seen.has(parameter.name)) {
					report(
						definition.node,
						messages.rejected(parameter.name, `@${definition.kind} ${definition.name}`),
						{ index: parameter.start, endIndex: parameter.start + parameter.name.length },
					)
				}
				seen.add(parameter.name)
			}
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
