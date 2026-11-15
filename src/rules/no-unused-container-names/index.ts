import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { get_declared_container_names } from '@projectwallace/css-analyzer/values'
import { get_container_query_name } from '@projectwallace/css-analyzer/atrules'
import { is_allowed } from '../../utils/option-validators.js'
import { DefinedUsed } from '../../utils/defined-used.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-unused-container-names'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected unused container name "${name}"`,
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

		const tracker = new DefinedUsed<Declaration>()

		root.walkDecls(/^container(-name)?$/i, (decl) => {
			for (const name of get_declared_container_names(decl.value)) {
				tracker.define(name, decl)
			}
		})

		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions
		const referenceRoots = (result.stylelint.referenceRoots as Root[] | undefined) ?? []
		for (const root_node of [root, ...referenceRoots]) {
			root_node.walkAtRules(/^container$/i, (atRule) => {
				const name = get_container_query_name(atRule.params)
				if (name) {
					tracker.use(name)
				}
			})
		}

		for (const [name, node] of tracker.unused()) {
			if (secondaryOptions?.ignore && is_allowed(name, secondaryOptions.ignore)) {
				continue
			}

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(name),
				node,
				word: name,
			})
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
