import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import { LAYER_NAME } from '@projectwallace/css-parser/nodes'
import { parse_atrule_prelude } from '@projectwallace/css-parser/parse-atrule-prelude'
import { is_allowed } from '../../utils/option-validators.js'
import { DefinedUsed } from '../../utils/defined-used.js'

const { createPlugin, utils } = stylelint

export const rule_name = 'projectwallace/no-unused-layers'

const messages = utils.ruleMessages(rule_name, {
	rejected: (layer: string) => `Layer "${layer}" was declared but never used`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unused-layers/README.md',
}

interface SecondaryOptions {
	ignore?: Array<string | RegExp>
}

function mark_ancestors_used(name: string, tracker: DefinedUsed<AtRule>) {
	const parts = name.split('.')
	for (let i = 1; i < parts.length; i++) {
		tracker.use(parts.slice(0, i).join('.'))
	}
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

		root.walkAtRules('layer', (atRule) => {
			if (atRule.nodes !== undefined) {
				// Block rule: @layer name { ... }
				const name = atRule.params.trim()
				if (name) {
					tracker.use(name)
					mark_ancestors_used(name, tracker)
				}
			} else {
				// Statement: @layer name; or @layer a, b, c;
				const names = atRule.params
					.split(',')
					.map((n) => n.trim())
					.filter(Boolean)
				for (const name of names) {
					tracker.define(name, atRule)
				}
			}
		})

		// @import url() layer(name) counts as usage of both `name` and all ancestor layers
		root.walkAtRules('import', (atRule) => {
			const parsed = parse_atrule_prelude('import', atRule.params)
			for (const child of parsed) {
				if (child.type === LAYER_NAME && child.name) {
					tracker.use(child.name)
					mark_ancestors_used(child.name, tracker)
				}
			}
		})

		for (const [layer, node] of tracker.unused()) {
			if (secondaryOptions?.ignore && is_allowed(layer, secondaryOptions.ignore)) {
				continue
			}

			utils.report({
				result,
				ruleName: rule_name,
				message: messages.rejected(layer),
				node,
				word: layer,
			})
		}
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
