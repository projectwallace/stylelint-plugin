import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import { get_animation_names } from '@projectwallace/css-analyzer/values'
import { get_keyframes_name } from '@projectwallace/css-analyzer/atrules'
import { is_allowed } from '../../utils/option-validators.js'
import { DefinedUsed } from '@projectwallace/css-analyzer/utils/collections'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-unused-keyframes'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected unused keyframe "${name}"`,
})

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

const ruleFunction = (primaryOptions: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		const tracker = new DefinedUsed<AtRule>()

		root.walkAtRules(/^keyframes$/i, (atRule) => {
			const name = get_keyframes_name(atRule.params)
			if (name) {
				tracker.define(name.value, atRule)
			}
		})

		if (tracker.defined_size === 0) {
			return
		}

		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions
		const referenceRoots = (result.stylelint.referenceRoots as Root[] | undefined) ?? []
		for (const root_node of [root, ...referenceRoots]) {
			root_node.walkDecls(/^animation(-name)?$/i, (decl) => {
				for (const name of get_animation_names(decl.value)) {
					tracker.use(name.value)
				}
			})
		}

		for (const [name, node] of tracker.unused_definitions()) {
			if (!node) {
				continue
			}
			if (secondaryOptions?.ignore && is_allowed(name, secondaryOptions.ignore)) {
				continue
			}

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(name),
				node,
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
