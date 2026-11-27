import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	get_definition,
	get_definitions,
	get_apply,
	collect_var_names,
	walk_function_calls,
} from '../../utils/function-mixin.js'
import { is_allowed } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-unused-parameters'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string, owner: string) => `Unexpected unused parameter "${name}" of ${owner}`,
})

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const ruleFunction = (primaryOption: true, secondaryOptions?: SecondaryOptions) => {
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
		const is_ignored = (value: string) =>
			secondaryOptions?.ignore !== undefined && is_allowed(value, secondaryOptions.ignore)
		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions

		for (const definition of get_definitions(root)) {
			const used = collect_var_names(definition.node)
			for (const parameter of definition.params) {
				if (used.has(parameter.name) || is_ignored(parameter.name)) {
					continue
				}
				report(
					definition.node,
					messages.rejected(parameter.name, `@${definition.kind} ${definition.name}`),
					{ index: parameter.start, endIndex: parameter.start + parameter.name.length },
				)
			}
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
