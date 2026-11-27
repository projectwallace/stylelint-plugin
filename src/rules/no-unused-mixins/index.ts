import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	get_definition,
	get_definitions,
	get_apply,
	collect_var_names,
	walk_function_calls,
} from '../../utils/function-mixin.js'
import { DefinedUsed } from '@projectwallace/css-analyzer/utils/collections'
import type { AtRule } from 'postcss'
import { is_allowed } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-unused-mixins'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected unused @mixin "${name}"`,
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
		const reference_roots = (result.stylelint.referenceRoots as Root[] | undefined) ?? []

		const tracker = new DefinedUsed<AtRule>()

		for (const definition of get_definitions(root, 'mixin')) {
			tracker.define(definition.name, definition.node)
		}

		if (tracker.defined_size === 0) {
			return
		}

		for (const root_node of [root, ...reference_roots]) {
			root_node.walkAtRules(/^apply$/i, (at_rule) => {
				const apply = get_apply(at_rule)
				if (apply) {
					tracker.use(apply.name)
				}
			})
		}

		for (const [name, node] of tracker.unused_definitions()) {
			if (node && !is_ignored(name)) {
				report(node, messages.rejected(name), { word: name })
			}
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
