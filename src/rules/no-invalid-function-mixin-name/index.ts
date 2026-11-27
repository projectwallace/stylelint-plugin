import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { is_custom } from '@projectwallace/css-parser/string-utils'
import {
	get_definition,
	get_definitions,
	get_apply,
	collect_var_names,
	walk_function_calls,
} from '../../utils/function-mixin.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-invalid-function-mixin-name'

const messages = utils.ruleMessages(rule_name, {
	rejected: (at_rule: string, name: string) =>
		`Unexpected name "${name}" for @${at_rule}, names must start with "--"`,
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

		root.walkAtRules(/^(function|mixin|apply)$/i, (at_rule) => {
			const name = (get_definition(at_rule) ?? get_apply(at_rule))?.name
			if (name !== undefined && !is_custom(name)) {
				report(at_rule, messages.rejected(at_rule.name.toLowerCase(), name), { word: name })
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
