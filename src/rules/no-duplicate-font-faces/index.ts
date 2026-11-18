import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { get_font_face_key } from '@projectwallace/css-analyzer/atrules'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-font-faces'

const messages = utils.ruleMessages(rule_name, {
	rejected: (family: string, weight: string, style: string) =>
		`Unexpected duplicate @font-face "${family}" (font-weight: ${weight}; font-style: ${style})`,
})

const ruleFunction = (primaryOptions: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOptions,
			possible: [true],
		})

		if (!validOptions) {
			return
		}

		const seen = new Set<string>()

		root.walkAtRules(/^font-face$/i, (at_rule) => {
			const descriptors: Record<string, string> = {}
			at_rule.each((child) => {
				if (child.type === 'decl') {
					descriptors[child.prop] = child.value
				}
			})

			const face = get_font_face_key(descriptors)
			if (!face) {
				return
			}

			if (seen.has(face.key)) {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(face.family, face.weight, face.style),
					node: at_rule,
				})
			} else {
				seen.add(face.key)
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
