import stylelint from 'stylelint'
import type { Root, Declaration } from 'postcss'
import { parse_value } from '@projectwallace/css-parser/parse-value'
import { parse_atrule_prelude, walk } from '@projectwallace/css-parser'
import { IDENTIFIER, OPERATOR } from '@projectwallace/css-parser/nodes'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-invalid-container-features'

const messages = utils.ruleMessages(rule_name, {
	rejected: (feature: string, name: string, declared: string, required: string) =>
		`Unexpected "${feature}" query on container "${name}" (declared as ${declared}), which requires container-type: ${required}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-invalid-container-features/README.md',
}

const INLINE_FEATURES = new Set(['width', 'inline-size'])
const SIZE_FEATURES = new Set(['height', 'block-size', 'aspect-ratio', 'orientation'])
const FEATURE_PATTERN =
	/(?<![\w-])((?:min-|max-)?(?:width|height|inline-size|block-size|aspect-ratio|orientation))(?![\w-])/gi
const KNOWN_TYPES = new Set(['normal', 'size', 'inline-size', 'scroll-state'])

type Declared = {
	// Union of container-type keywords for this name, or null when unknown
	types: Set<string> | null
}

type Group = {
	names: string[]
	types: Set<string> | null | undefined // undefined = no type declared, null = unknown
}

function parse_container_value(decl: Declaration): { names: string[]; types: string[] } | null {
	const value = decl.value.trim()
	if (/var\(|env\(|attr\(/i.test(value)) return null
	const is_shorthand = decl.prop.toLowerCase() === 'container'
	const names: string[] = []
	const types: string[] = []
	let after_slash = false
	for (const node of parse_value(value)) {
		if (node.type === OPERATOR) {
			after_slash = true
			continue
		}
		if (node.type !== IDENTIFIER) return null
		const text = node.text.toLowerCase()
		if (!is_shorthand) {
			;(decl.prop.toLowerCase() === 'container-type' ? types : names).push(node.text)
		} else if (after_slash) {
			types.push(text)
		} else {
			names.push(node.text)
		}
	}
	return { names, types }
}

function collect(root: Root, declared: Map<string, Declared>): void {
	const groups = new Map<unknown, Group>()

	root.walkDecls(/^container(-name|-type)?$/i, (decl) => {
		let group = groups.get(decl.parent)
		if (!group) {
			group = { names: [], types: undefined }
			groups.set(decl.parent, group)
		}
		const prop = decl.prop.toLowerCase()
		const parsed = parse_container_value(decl)
		if (prop === 'container-name') {
			group.names = parsed?.names ?? []
			return
		}
		if (prop === 'container') {
			// Shorthand resets both name and type
			group.names = parsed?.names ?? []
			group.types = parsed ? new Set(parsed.types.length > 0 ? parsed.types : ['normal']) : null
			return
		}
		group.types = parsed ? new Set(parsed.types.map((t) => t.toLowerCase())) : null
	})

	for (const group of groups.values()) {
		const unknown =
			group.types === undefined ||
			group.types === null ||
			[...group.types].some((t) => !KNOWN_TYPES.has(t))
		for (const name of group.names) {
			const entry = declared.get(name) ?? { types: new Set<string>() }
			if (unknown || entry.types === null) {
				entry.types = null
			} else {
				for (const t of group.types as Set<string>) entry.types.add(t)
			}
			declared.set(name, entry)
		}
	}
}

function describe(types: Set<string>): string {
	return [...types].join(' ')
}

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) return

		const declared = new Map<string, Declared>()
		// referenceRoots is available in stylelint >=17.9.0; undefined in older versions
		const referenceRoots = (result.stylelint.referenceRoots as Root[] | undefined) ?? []
		for (const root_node of [root, ...referenceRoots]) {
			collect(root_node, declared)
		}

		root.walkAtRules(/^container$/i, (at_rule) => {
			const params = at_rule.params
			if (!params) return
			const params_offset = 1 + at_rule.name.length + (at_rule.raws.afterName ?? ' ').length

			for (const query of parse_atrule_prelude('container', params)) {
				const first = query.first_child
				if (first?.type !== IDENTIFIER) continue
				const entry = declared.get(first.text)
				if (!entry || entry.types === null) continue
				const types = entry.types
				const has_size = types.has('size')
				const has_inline = has_size || types.has('inline-size')

				walk(query, (node) => {
					const type_name = node.type_name
					if (type_name === 'Function') {
						if (/^scroll-state\(/i.test(node.text) && !types.has('scroll-state')) {
							utils.report({
								message: messages.rejected(
									'scroll-state()',
									first.text,
									describe(types),
									'scroll-state',
								),
								node: at_rule,
								index: params_offset + node.start,
								endIndex: params_offset + node.end,
								result,
								ruleName: rule_name,
							})
						}
						return
					}
					if (type_name !== 'MediaFeatureRange' && type_name !== 'Feature') return

					FEATURE_PATTERN.lastIndex = 0
					for (const match of node.text.matchAll(FEATURE_PATTERN)) {
						const feature = match[1]!
						const base = feature.toLowerCase().replace(/^(min|max)-/, '')
						let required: string | undefined
						if (SIZE_FEATURES.has(base) && !has_size) required = 'size'
						else if (INLINE_FEATURES.has(base) && !has_inline) required = 'inline-size or size'
						if (!required) continue
						const index = params_offset + node.start + match.index!
						utils.report({
							message: messages.rejected(feature, first.text, describe(types), required),
							node: at_rule,
							index,
							endIndex: index + feature.length,
							result,
							ruleName: rule_name,
						})
					}
				})
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
