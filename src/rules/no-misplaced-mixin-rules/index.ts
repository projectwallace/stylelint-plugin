import stylelint from 'stylelint'
import type { Root, AtRule, Container, Document } from 'postcss'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-misplaced-mixin-rules'

const messages = utils.ruleMessages(rule_name, {
	rejected: (message: string) => message,
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

		const has_ancestor = (
			node: Container | Document | undefined,
			test: (ancestor: Container | Document) => boolean,
		) => {
			for (let parent = node; parent && parent.type !== 'root'; parent = parent.parent) {
				if (test(parent)) {
					return true
				}
			}
			return false
		}
		const is_mixin = (node: Container | Document) =>
			node.type === 'atrule' && (node as AtRule).name.toLowerCase() === 'mixin'
		const is_style_rule = (node: Container | Document) => node.type === 'rule'

		root.walkAtRules(/^(mixin|contents|apply)$/i, (at_rule) => {
			const name = at_rule.name.toLowerCase()
			if (name === 'mixin' && has_ancestor(at_rule.parent, is_style_rule)) {
				report(
					at_rule,
					messages.rejected(
						'Unexpected @mixin inside a style rule, @mixin can only be used at the top level',
					),
				)
			} else if (name === 'contents' && !has_ancestor(at_rule.parent, is_mixin)) {
				report(
					at_rule,
					messages.rejected('Unexpected @contents outside of a @mixin, it is ignored'),
				)
			} else if (
				name === 'apply' &&
				!has_ancestor(at_rule.parent, (ancestor) => is_mixin(ancestor) || is_style_rule(ancestor))
			) {
				report(
					at_rule,
					messages.rejected('Unexpected @apply outside of a style rule or @mixin, it is ignored'),
				)
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
