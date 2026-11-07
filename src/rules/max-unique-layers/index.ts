import stylelint from 'stylelint'
import type { Root, Container, AtRule } from 'postcss'
import { FUNCTION, LAYER_NAME } from '@projectwallace/css-parser/nodes'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { str_equals } from '@projectwallace/css-parser/string-utils'
import {
	is_allowed,
	ignore_option_validators,
	is_valid_non_negative_integer,
} from '../../utils/option-validators.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/max-unique-layers'

const messages = utils.ruleMessages(rule_name, {
	rejected: (actual: number, expected: number) =>
		`Expected no more than ${expected} unique layers but found ${actual}`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/max-unique-layers/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

function qualified_scope(at_rule: AtRule): string | undefined {
	const names: string[] = []
	let parent = at_rule.parent as Container | undefined
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

const ruleFunction = (primaryOption: number, secondaryOptions?: SecondaryOptions) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(
			result,
			rule_name,
			{
				actual: primaryOption,
				possible: [is_valid_non_negative_integer],
			},
			{
				actual: secondaryOptions,
				possible: {
					ignore: ignore_option_validators,
				},
				optional: true,
			},
		)

		if (!validOptions) return

		const ignore = secondaryOptions?.ignore ?? []
		const unique = new Set<string>()
		const violations: Array<{ node: AtRule; word: string }> = []

		function add(value: string, node: AtRule, word: string) {
			if (unique.has(value) || is_allowed(value, ignore)) return
			unique.add(value)
			if (unique.size > primaryOption) {
				violations.push({ node, word })
			}
		}

		root.walkAtRules(/^layer$/i, (at_rule) => {
			const scope = qualified_scope(at_rule)
			if (scope === undefined) return
			for (const raw of at_rule.params.split(',')) {
				const name = raw.trim()
				if (!name) continue
				add(scope ? `${scope}.${name}` : name, at_rule, name)
			}
		})

		root.walkAtRules(/^import$/i, (at_rule) => {
			for (const child of parse_atrule_prelude('import', at_rule.params)) {
				if (child.type !== FUNCTION || !str_equals('layer', child.name)) continue
				const layer = child.first_child
				if (layer?.type === LAYER_NAME && layer.name) {
					add(layer.name, at_rule, layer.name)
				}
			}
		})

		const actual = unique.size
		for (const { node, word } of violations) {
			utils.report({
				message: messages.rejected(actual, primaryOption),
				node,
				word,
				result,
				ruleName: rule_name,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

const plugin: stylelint.Plugin = createPlugin(rule_name, ruleFunction)

export default plugin
