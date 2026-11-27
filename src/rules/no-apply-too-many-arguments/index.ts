import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_definitions, get_apply } from '../../utils/function-mixin.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-apply-too-many-arguments'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string, actual: number, expected: number) =>
		`Unexpected ${actual} arguments for mixin "${name}", it only has ${expected} parameters`,
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
		const reference_roots = (result.stylelint.referenceRoots as Root[] | undefined) ?? []

		const parameter_counts = new Map<string, number>()
		for (const root_node of [root, ...reference_roots]) {
			for (const definition of get_definitions(root_node, 'mixin')) {
				parameter_counts.set(definition.name, definition.params.length)
			}
		}

		root.walkAtRules(/^apply$/i, (at_rule) => {
			const apply = get_apply(at_rule)
			const expected = apply && parameter_counts.get(apply.name)
			if (apply && expected !== undefined && apply.argument_count > expected) {
				report(at_rule, messages.rejected(apply.name, apply.argument_count, expected), {
					word: apply.name,
				})
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
