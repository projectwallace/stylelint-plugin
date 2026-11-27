import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	get_definition,
	get_definitions,
	get_apply,
	collect_var_names,
	walk_function_calls,
} from '../../utils/function-mixin.js'
import type { Rule, AtRule, Container, Document } from 'postcss'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-mixins'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate @mixin "${name}"`,
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

		const layer_of = (at_rule: AtRule): string => {
			const layers: string[] = []
			let parent: Container | Document | undefined = at_rule.parent
			while (parent && parent.type !== 'root') {
				if (parent.type === 'atrule' && (parent as AtRule).name.toLowerCase() === 'layer') {
					layers.push((parent as AtRule).params)
				}
				parent = parent.parent
			}
			return layers.join('/')
		}

		// Definitions in different cascade layers override each other on purpose
		const seen = new Set<string>()
		for (const definition of get_definitions(root, 'mixin')) {
			const key = `${layer_of(definition.node)}|${definition.name}`
			if (seen.has(key)) {
				report(definition.node, messages.rejected(definition.name), { word: definition.name })
			}
			seen.add(key)
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
