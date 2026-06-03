import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { IDENTIFIER, OPERATOR } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { keywords } from '@projectwallace/css-analyzer/values'
import { is_allowed } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unknown-container-names'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) =>
		`Container name "${name}" is used in a @container query but was never declared`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unknown-container-names/README.md',
}

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

		root.walkDecls(/^container(-name)?$/i, (decl) => {
			if (keywords.has(decl.value.trim())) {
				return
			}
			const ast = parse_value(decl.value)
			for (const node of ast) {
				if (node.type === OPERATOR) {
					break
				}
				if (node.type === IDENTIFIER) {
					declared_names.add(node.text)
				}
			}
		})

		root.walkAtRules('container', (atRule) => {
			const prelude = parse_atrule_prelude('container', atRule.params.trim())
			const first_child = prelude.at(0)?.first_child
			if (first_child?.type !== IDENTIFIER) {
				return
			}
			const name = first_child.text
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

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
