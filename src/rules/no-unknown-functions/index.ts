import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_definitions, walk_function_calls } from '../../utils/function-mixin.js'
import { is_allowed } from '../../utils/option-validators.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-unknown-functions'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected unknown custom function "${name}"`,
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

		const defined = new Set<string>()
		for (const root_node of [root, ...reference_roots]) {
			for (const definition of get_definitions(root_node, 'function')) {
				defined.add(definition.name)
			}
		}

		root.walkDecls((declaration) => {
			walk_function_calls(declaration, (name) => {
				if (!defined.has(name) && !is_ignored(name)) {
					report(declaration, messages.rejected(name), { word: name })
				}
			})
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
