import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { IDENTIFIER, OPERATOR } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { keywords } from '@projectwallace/css-analyzer/values'
import { is_allowed } from '../../utils/option-validators.js'
import { DefinedUsed } from '../../utils/defined-used.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unused-container-names'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected unused container name "${name}"`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unused-container-names/README.md',
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

		const tracker = new DefinedUsed<Declaration>()

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
					tracker.define(node.text, decl)
				}
			}
		})

		root.walkAtRules('container', (atRule) => {
			const prelude = parse_atrule_prelude('container', atRule.params.trim())
			const first_child = prelude.at(0)?.first_child
			if (first_child?.type === IDENTIFIER) {
				tracker.use(first_child.text)
			}
		})

		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions
		const referenceRoots = (result.stylelint.referenceRoots as Root[] | undefined) ?? []
		for (const referenceRoot of referenceRoots) {
			referenceRoot.walkAtRules('container', (atRule) => {
				const prelude = parse_atrule_prelude('container', atRule.params.trim())
				const first_child = prelude.at(0)?.first_child
				if (first_child?.type === IDENTIFIER) {
					tracker.use(first_child.text)
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

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
