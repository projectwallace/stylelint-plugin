import stylelint from 'stylelint'
import type { Root, AtRule, Container } from 'postcss'
import { unquote } from '../../utils/unquote.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-duplicate-font-faces'

const messages = utils.ruleMessages(rule_name, {
	rejected: (family: string, weight: string, style: string) =>
		`Unexpected duplicate @font-face "${family}" (font-weight: ${weight}; font-style: ${style})`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-duplicate-font-faces/README.md',
}

const WEIGHT_KEYWORDS: Record<string, string> = { normal: '400', bold: '700' }

function normalize(value: string | undefined, fallback: string): string {
	const v = value?.trim().toLowerCase().replaceAll(/\s+/g, ' ')
	return v || fallback
}

/** Describes the at-rules (@media, @layer, @supports, …) a node is nested in. */
function context_of(node: AtRule): string {
	const parts: string[] = []
	let parent: Container | undefined = node.parent as Container | undefined
	while (parent && parent.type !== 'root') {
		if (parent.type === 'atrule') {
			const at_rule = parent as AtRule
			parts.push(`@${at_rule.name.toLowerCase()} ${at_rule.params.trim().toLowerCase()}`)
		}
		parent = parent.parent as Container | undefined
	}
	return parts.join(' < ')
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

		root.walkAtRules(/^font-face$/i, (at_rule) => {
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

			const key = [
				context_of(at_rule),
				family.toLowerCase(),
				normalized_weight,
				style,
				normalized_stretch,
				range,
			].join('|')

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

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

const plugin: stylelint.Plugin = createPlugin(rule_name, ruleFunction)

export default plugin
