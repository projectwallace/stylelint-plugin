import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { destructureFontShorthand } from '@projectwallace/css-analyzer/values'
import { str_equals, str_index_of, is_custom } from '@projectwallace/css-parser/string-utils'
import { is_allowed, ignore_option_validators } from '../../utils/option-validators.js'
import { split_font_families } from '../../utils/font-families.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-unused-font-faces'

const messages = utils.ruleMessages(rule_name, {
	rejected: (family: string) => `Unexpected unused @font-face "${family}"`,
})

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

function noop() {}

function is_in_font_face(node: { parent?: unknown }): boolean {
	const parent = node.parent as AtRule | undefined
	return parent?.type === 'atrule' && str_equals('font-face', parent.name)
}

const ruleFunction = (primaryOptions: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(
			result,
			rule_name,
			{
				actual: primaryOptions,
				possible: [true],
			},
			{
				actual: secondaryOptions,
				possible: {
					ignore: ignore_option_validators,
				},
				optional: true,
			},
		)

		if (!validOptions) {
			return
		}

		// lower-cased family name -> [original name, @font-face nodes]
		const defined = new Map<string, { family: string; nodes: AtRule[] }>()

		root.walkAtRules(/^font-face$/i, (at_rule) => {
			at_rule.walkDecls(/^font-family$/i, (decl) => {
				if (decl.parent !== at_rule) {
					return
				}
				const [family] = split_font_families(decl.value)
				if (!family) {
					return
				}
				const key = family.toLowerCase()
				const entry = defined.get(key)
				if (entry) {
					entry.nodes.push(at_rule)
				} else {
					defined.set(key, { family, nodes: [at_rule] })
				}
			})
		})

		if (defined.size === 0) {
			return
		}

		const used = new Set<string>()
		const use = (name: string) => used.add(name.toLowerCase())

		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions
		const referenceRoots = (result.stylelint.referenceRoots as Root[] | undefined) ?? []
		for (const root_node of [root, ...referenceRoots]) {
			root_node.walkDecls((decl) => {
				const prop = decl.prop.toLowerCase()

				if (prop === 'font-family') {
					if (is_in_font_face(decl)) {
						return
					}
					for (const family of split_font_families(decl.value)) {
						use(family)
					}
				} else if (prop === 'font') {
					const destructured = destructureFontShorthand(parse_value(decl.value), noop)
					if (destructured?.font_family) {
						for (const family of split_font_families(destructured.font_family)) {
							use(family)
						}
					}
				}

				// A family can be hidden in a custom property or behind a var() fallback.
				// We can't resolve those, so treat every name mentioned there as used.
				if (is_custom(prop) || str_index_of('var(', decl.value) !== -1) {
					for (const family of split_font_families(decl.value, true)) {
						use(family)
					}
				}
			})

			root_node.walkAtRules(/^font-feature-values$/i, (at_rule) => {
				for (const family of split_font_families(at_rule.params)) {
					use(family)
				}
			})
		}

		for (const [key, { family, nodes }] of defined) {
			if (used.has(key)) {
				continue
			}
			if (secondaryOptions?.ignore && is_allowed(family, secondaryOptions.ignore)) {
				continue
			}

			for (const node of nodes) {
				utils.report({
					result,
					ruleName: rule_name,
					message: messages.rejected(family),
					node,
				})
			}
		}
	}
}

const plugin: stylelint.Plugin = define_rule(rule_name, ruleFunction, messages)

export default plugin
