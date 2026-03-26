import stylelint from 'stylelint'
import type { Root, AtRule } from 'postcss'
import {
	collect_bounds_from_prelude,
	find_contradictory_feature,
} from '../../utils/media-conditions.js'
import type { Bound } from '../../utils/media-conditions.js'

const { createPlugin, utils } = stylelint

const rule_name = 'projectwallace/no-unreachable-nested-atrule'

const messages = utils.ruleMessages(rule_name, {
	rejected: (atrule: string, feature: string, lower: string, upper: string) =>
		`Feature "${feature}" creates an unreachable condition in nested @${atrule} rules: lower bound (${lower}) exceeds upper bound (${upper})`,
})

const meta = {
	url: 'https://github.com/projectwallace/stylelint-plugin/blob/main/src/rules/no-unreachable-nested-atrule/README.md',
}

/**
 * Extract the container name from a @container params string.
 * e.g. "sidebar (min-width: 100px)" → "sidebar"
 *      "(min-width: 100px)"         → ""
 */
function get_container_name(params: string): string {
	const trimmed = params.trim()
	if (trimmed.startsWith('(')) return ''
	const match = trimmed.match(/^([\w-]+)/)
	return match ? match[1] : ''
}

const ruleFunction = (primaryOption: true) => {
	return (root: Root, result: stylelint.PostcssResult) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		})

		if (!validOptions) return

		root.walkAtRules(/^(media|container)$/i, (atRule) => {
			const name = atRule.name.toLowerCase()

			// Collect bounds from the current at-rule
			const current_bounds = collect_bounds_from_prelude(name, atRule.params)
			if (current_bounds === null) return

			// If the current rule alone is contradictory, no-unreachable-media-conditions
			// already handles it — skip here to avoid double-reporting.
			if (find_contradictory_feature(current_bounds) !== null) return

			// Walk up the ancestor chain collecting bounds from same-type at-rules
			const ancestor_bounds: Bound[] = []
			let node = atRule.parent

			while (node) {
				if (node.type === 'atrule') {
					const ancestor = node as AtRule
					const ancestor_name = ancestor.name.toLowerCase()

					if (ancestor_name === name) {
						// For @container: only AND when both use the same non-empty name.
						// Unnamed @container rules each apply to their own nearest ancestor
						// container element, so nesting them doesn't form an AND condition
						// on the same container.
						if (name === 'container') {
							const current_cname = get_container_name(atRule.params)
							const ancestor_cname = get_container_name(ancestor.params)
							if (
								current_cname === '' ||
								ancestor_cname === '' ||
								current_cname !== ancestor_cname
							) {
								node = node.parent
								continue
							}
						}

						const bounds = collect_bounds_from_prelude(ancestor_name, ancestor.params)
						// Ancestor is too complex to analyse — abort to avoid false positives
						if (bounds === null) return
						ancestor_bounds.push(...bounds)
					}
				}

				node = node.parent
			}

			// Nothing to AND with
			if (ancestor_bounds.length === 0) return

			// If the ancestors already form a contradiction amongst themselves, the inner
			// rule is unreachable for that reason — skip to avoid confusing duplicate reports.
			if (find_contradictory_feature(ancestor_bounds) !== null) return

			// Check whether the combination of ancestor + current bounds is contradictory
			const contradiction = find_contradictory_feature([...ancestor_bounds, ...current_bounds])
			if (contradiction === null) return

			const lower = `${contradiction.lower.value}${contradiction.lower.unit}`
			const upper = `${contradiction.upper.value}${contradiction.upper.unit}`

			utils.report({
				message: messages.rejected(name, contradiction.feature, lower, upper),
				node: atRule,
				word: `@${name}`,
				result,
				ruleName: rule_name,
			})
		})
	}
}

ruleFunction.ruleName = rule_name
ruleFunction.messages = messages
ruleFunction.meta = meta

export default createPlugin(rule_name, ruleFunction)
