import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import { get_font_families } from '@projectwallace/css-analyzer/values'
import { str_equals, str_index_of, is_custom } from '@projectwallace/css-parser/string-utils'
import { is_allowed, validate_options_with_ignore } from '../../utils/option-validators.js'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { parse_value_of } from '../../utils/parse.js'
import { is_in_font_face } from '../../utils/font-face.js'
import { define_rule } from '../../utils/define-rule.js'

const { utils } = stylelint

const rule_name = 'projectwallace/no-unused-font-faces'

const messages = utils.ruleMessages(rule_name, {
	rejected: (family: string) => `Unexpected unused @font-face "${family}"`,
})

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

// Names of several words are the same family whatever the whitespace between the words
function normalize_family(name: string): string {
	return name.replaceAll(/\s+/g, ' ')
}

const ruleFunction = (primaryOptions: true, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = validate_options_with_ignore(
			result,
			rule_name,
			primaryOptions,
			secondaryOptions,
			[true],
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
				const raw_family = get_font_families(parse_value_of(decl))[0]?.name
				if (!raw_family) {
					return
				}
				const family = normalize_family(raw_family)
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
					for (const family of get_font_families(parse_value_of(decl))) {
						use(normalize_family(family.name))
					}
				} else if (prop === 'font') {
					for (const family of get_font_families(parse_value_of(decl), 'font')) {
						use(normalize_family(family.name))
					}
				}

				// A family can be hidden in a custom property or behind a var() fallback.
				// We can't resolve those, so treat every name mentioned there as used.
				if (is_custom(prop) || str_index_of('var(', decl.value) !== -1) {
					for (const family of get_font_families(parse_value_of(decl), 'font-family', {
						deep: true,
					})) {
						use(normalize_family(family.name))
					}
				}
			})

			root_node.walkAtRules(/^font-feature-values$/i, (at_rule) => {
				for (const family of get_font_families(parse_value(at_rule.params))) {
					use(normalize_family(family.name))
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
