import stylelint from 'stylelint'
import type { Root, AtRule, Declaration } from 'postcss'
import { IDENTIFIER, OPERATOR } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { keywords } from '@projectwallace/css-analyzer/values'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-custom-idents'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) => `Unexpected duplicate custom identifier "${name}"`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-duplicate-custom-idents/README.md',
}

type SourceNode = AtRule | Declaration

const ruleFunction = (primaryOptions: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		// Each category has its own namespace: keyframe names, @property names,
		// container names, and anchor names are all independent namespaces.
		const seen_keyframes = new Map<string, SourceNode>()
		const seen_property = new Map<string, SourceNode>()
		const seen_container = new Map<string, SourceNode>()
		const seen_anchor = new Map<string, SourceNode>()

		function is_reserved(name: string): boolean {
			return keywords.has(name.toLowerCase())
		}

		function check_duplicate(
			seen: Map<string, SourceNode>,
			name: string,
			node: SourceNode,
			word: string,
		): void {
			if (is_reserved(name)) return
			if (seen.has(name)) {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(name),
					node,
					word,
				})
			} else {
				seen.set(name, node)
			}
		}

		root.walkAtRules(/^keyframes$/i, (atRule) => {
			const name = atRule.params.trim()
			if (name) {
				check_duplicate(seen_keyframes, name, atRule, name)
			}
		})

		root.walkAtRules(/^property$/i, (atRule) => {
			const name = atRule.params.trim()
			if (name) {
				check_duplicate(seen_property, name, atRule, name)
			}
		})

		root.walkDecls(/^container(-name)?$/i, (decl) => {
			if (is_reserved(decl.value.trim())) return
			const ast = parse_value(decl.value)
			for (const node of ast) {
				// The `/` in `container: name / type` is an OPERATOR — stop there
				if (node.type === OPERATOR) break
				if (node.type === IDENTIFIER) {
					check_duplicate(seen_container, node.text, decl, node.text)
				}
			}
		})

		root.walkDecls(/^anchor-name$/i, (decl) => {
			if (is_reserved(decl.value.trim())) return
			const ast = parse_value(decl.value)
			for (const node of ast) {
				// anchor-name values are comma-separated dashed-idents; commas are
				// OPERATOR nodes — skip them and keep iterating
				if (node.type === IDENTIFIER) {
					check_duplicate(seen_anchor, node.text, decl, node.text)
				}
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
