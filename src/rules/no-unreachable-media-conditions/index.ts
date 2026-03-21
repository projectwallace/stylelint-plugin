import stylelint from 'stylelint'
import type { Root } from 'postcss'
import {
	parse_atrule_prelude,
	walk,
	MEDIA_QUERY,
	MEDIA_FEATURE,
	FEATURE_RANGE,
	PRELUDE_OPERATOR,
} from '@projectwallace/css-parser'
import {
	collect_bound_from_media_feature,
	collect_bounds_from_feature_range,
	find_contradictory_feature,
} from '../../utils/media-conditions.js'
import type { Bound } from '../../utils/media-conditions.js'

const { createPlugin, utils } = stylelint

const rule_name = 'project-wallace/no-unreachable-media-conditions'

const messages = utils.ruleMessages(rule_name, {
	rejected: (feature: string) => `Media feature "${feature}" creates an unreachable condition`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin',
}

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) return

		root.walkAtRules('media', (atRule) => {
			const prelude = atRule.params
			if (!prelude) return

			const parsed = parse_atrule_prelude('media', prelude)

			for (const query_node of parsed) {
				if (query_node.type !== MEDIA_QUERY) continue

				// Skip queries that contain `not` or `or` — too complex to analyse safely
				let skip = false
				walk(query_node, (node) => {
					if (node.type === PRELUDE_OPERATOR) {
						const op = node.text.trim().toLowerCase()
						if (op === 'not' || op === 'or') {
							skip = true
						}
					}
				})
				if (skip) continue

				// Collect all bounds from this media query
				const bounds: Bound[] = []

				walk(query_node, (node) => {
					if (node.type === MEDIA_FEATURE) {
						const bound = collect_bound_from_media_feature(node)
						if (bound) bounds.push(bound)
					} else if (node.type === FEATURE_RANGE) {
						bounds.push(...collect_bounds_from_feature_range(node))
					}
				})

				const contradictory_feature = find_contradictory_feature(bounds)

				if (contradictory_feature !== null) {
					utils.report({
						message: messages.rejected(contradictory_feature),
						node: atRule,
						result,
						ruleName: rule_name,
					})
					// Only report once per @media rule
					break
				}
			}
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
