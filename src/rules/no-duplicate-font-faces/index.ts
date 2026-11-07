import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { unquote } from '../../utils/unquote.js'
import { define_rule } from '../../utils/define-rule.js'
import { walk_atrules } from '../../utils/walk.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-font-faces'

const messages = utils.ruleMessages(rule_name, {
	rejected: (family: string, weight: string, style: string) =>
		`Unexpected duplicate @font-face "${family}" (font-weight: ${weight}; font-style: ${style})`,
})

const WEIGHT_KEYWORDS: Record<string, string> = { normal: '400', bold: '700' }

function normalize(value: string | undefined, fallback: string): string {
	const v = value?.trim().toLowerCase().replaceAll(/\s+/g, ' ')
	return v || fallback
}

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

		walk_atrules(root, ['font-face'], (at_rule) => {
			const descriptors = new Map<string, string>()
			at_rule.each((child) => {
				if (child.type === 'decl') {
					descriptors.set(child.prop.toLowerCase(), child.value)
				}
			})

			const raw_family = descriptors.get('font-family')
			if (!raw_family) {
				return
			}

			const family = unquote(raw_family.trim())
			const weight = normalize(descriptors.get('font-weight'), '400')
			const style = normalize(descriptors.get('font-style'), 'normal')
			const stretch = normalize(descriptors.get('font-stretch'), '100%')
			const range = normalize(descriptors.get('unicode-range'), '').replaceAll(/\s+/g, '')

			const normalized_weight = WEIGHT_KEYWORDS[weight] ?? weight
			const normalized_stretch = stretch === 'normal' ? '100%' : stretch

			const key = [family.toLowerCase(), normalized_weight, style, normalized_stretch, range].join(
				'|',
			)

			if (seen.has(key)) {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(family, normalized_weight, style),
					node: at_rule,
				})
			} else {
				seen.add(key)
			}
		})
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
