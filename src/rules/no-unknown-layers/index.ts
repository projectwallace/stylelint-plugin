import stylelint from 'stylelint'
import type { Root, AtRule, Container } from 'postcss'
import { FUNCTION, LAYER_NAME } from '@projectwallace/css-parser/nodes'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { str_equals } from '@projectwallace/css-parser/string-utils'
import { is_allowed, ignore_option_validators } from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unknown-layers'

const messages = utils.ruleMessages(rule_name, {
	rejected: (layer: string) => `Unexpected unknown layer "${layer}"`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unknown-layers/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

function split_names(params: string): string[] {
	return params
		.split(',')
		.map((n) => n.trim())
		.filter(Boolean)
}

/**
 * The qualified name of the layer scope a node lives in ('' for the root).
 * Returns undefined when an enclosing layer is anonymous.
 */
function scope_of(node: AtRule): string | undefined {
	const names: string[] = []
	let parent: Container | undefined = node.parent as Container | undefined
	while (parent && parent.type !== 'root') {
		if (parent.type === 'atrule' && str_equals('layer', (parent as AtRule).name)) {
			const name = (parent as AtRule).params.trim()
			if (!name) return undefined
			names.unshift(name)
		}
		parent = parent.parent as Container | undefined
	}
	return names.join('.')
}

function qualify(scope: string, name: string): string {
	return scope ? `${scope}.${name}` : name
}

/** `a.b.c` declares `a`, `a.b` and `a.b.c` */
function declare(declared: Set<string>, qualified: string) {
	const parts = qualified.split('.')
	for (let i = 1; i <= parts.length; i++) {
		declared.add(parts.slice(0, i).join('.'))
	}
}

function declared_by_import(at_rule: AtRule): string | undefined {
	for (const child of parse_atrule_prelude('import', at_rule.params)) {
		if (child.type === FUNCTION && str_equals('layer', child.name)) {
			const layer = child.first_child
			if (layer?.type === LAYER_NAME && layer.name) return layer.name
		}
	}
	return undefined
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

		// Layers that were declared somewhere (statements, @import layer(), reference files)
		const declared = new Set<string>()
		// Scopes that have an explicit `@layer a, b;` order statement. Only those scopes are checked.
		const ordered_scopes = new Set<string>()
		const blocks: Array<{ at_rule: AtRule; qualified: string; scope: string; name: string }> = []

		function collect(root_node: Root, is_current: boolean) {
			root_node.walkAtRules((at_rule) => {
				if (str_equals('import', at_rule.name)) {
					const layer = declared_by_import(at_rule)
					if (layer) declare(declared, layer)
					return
				}

				if (!str_equals('layer', at_rule.name)) return

				const scope = scope_of(at_rule)
				if (scope === undefined) return

				if (at_rule.nodes === undefined) {
					// Statement: @layer a, b, c;
					ordered_scopes.add(scope)
					for (const name of split_names(at_rule.params)) {
						declare(declared, qualify(scope, name))
					}
				} else {
					// Block: @layer a { ... }
					const name = at_rule.params.trim()
					if (!name || name.includes(',')) return
					const qualified = qualify(scope, name)
					if (is_current) {
						blocks.push({ at_rule, qualified, scope, name })
					} else {
						declare(declared, qualified)
					}
				}
			})
		}

		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions
		const referenceRoots = (result.stylelint.referenceRoots as Root[] | undefined) ?? []
		for (const reference_root of referenceRoots) {
			collect(reference_root, false)
		}
		collect(root, true)

		if (ordered_scopes.size === 0) {
			return
		}

		for (const { at_rule, qualified, scope, name } of blocks) {
			if (!ordered_scopes.has(scope) || declared.has(qualified)) continue
			if (secondaryOptions?.ignore && is_allowed(qualified, secondaryOptions.ignore)) continue

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(qualified),
				node: at_rule,
				word: name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

const plugin: stylelint.Plugin = createPlugin(rule_name, ruleFunction)

export default plugin
