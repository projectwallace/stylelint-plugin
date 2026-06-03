import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import { analyzeAnimation } from '@projectwallace/css-analyzer/values'
import { IDENTIFIER, STRING } from '@projectwallace/css-parser/nodes'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { is_allowed } from '../../utils/option-validators.js'
import { DefinedUsed } from '../../utils/defined-used.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unused-keyframes'

const messages = utils.ruleMessages(rule_name, {
	rejected: (name: string) =>
		`Keyframes "${name}" was declared but never used in an animation-name or animation`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unused-keyframes/README.md',
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

		const tracker = new DefinedUsed<AtRule>()

		root.walkAtRules(/^keyframes$/i, (atRule) => {
			const name = atRule.params.trim()
			if (name) {
				tracker.define(name, atRule)
			}
		})

		if (tracker.defined_size === 0) {
			return
		}

		root.walkDecls(/^animation-name$/i, (decl) => {
			const ast = parse_value(decl.value)
			for (const node of ast) {
				if (node.type === IDENTIFIER) {
					if (node.text.toLowerCase() !== 'none') {
						tracker.use(node.text)
					}
				} else if (node.type === STRING) {
					// Suprisingly: keyframe names MAY be quoted
					tracker.use(node.text)
				}
			}
		})

		root.walkDecls(/^animation$/i, (decl) => {
			const ast = parse_value(decl.value)
			analyzeAnimation(ast, ({ type, value }) => {
				if (type === 'name') {
					tracker.use(value.text)
				}
			})
			// analyzeAnimation doesn't handle <string> nodes; quoted names are valid
			// per spec (<keyframes-name> = <custom-ident> | <string>) but the
			// function silently skips them — work around it here until that's fixed
			for (const node of ast) {
				if (node.type === STRING) {
					// Suprisingly: keyframe names MAY be quoted
					tracker.use(node.text)
				}
			}
		})

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
