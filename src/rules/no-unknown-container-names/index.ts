import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_declared_container_names } from '@projectwallace/css-analyzer/values'
import { get_container_query_name } from '@projectwallace/css-analyzer/atrules'
import { is_allowed } from '../../utils/option-validators.js'
import { parse_prelude_of, parse_value_of } from '../../utils/parse.js'
import { define_rule } from '../../utils/define-rule.js'

function collect_container_names(root: Root, declared: Set<string>): void {
	root.walkDecls(/^container(-name)?$/i, (decl) => {
		for (const name of get_declared_container_names(parse_value_of(decl))) {
			declared.add(name.value)
		}
	})
}

const { utils } = stylelint

const rule_name = 'projectwallace/no-unknown-container-names'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected unknown container name "${name}"`,
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

		const declared_names = new Set<string>()

		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions
		const referenceRoots = (result.stylelint.referenceRoots as Root[] | undefined) ?? []
		for (const root_node of [root, ...referenceRoots]) {
			collect_container_names(root_node, declared_names)
		}

		root.walkAtRules(/^container$/i, (atRule) => {
			const prelude = parse_prelude_of(atRule)
			const match = prelude && get_container_query_name(prelude)
			if (!match) {
				return
			}
			const name = match.value
			if (declared_names.has(name)) {
				return
			}
			if (secondaryOptions?.ignore && is_allowed(name, secondaryOptions.ignore)) {
				return
			}
			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(name),
				node: atRule,
				word: name,
			})
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
