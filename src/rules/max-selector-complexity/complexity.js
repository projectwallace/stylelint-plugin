import { walk } from 'css-tree'
import { hasVendorPrefix } from '../../vendor-prefix.js'

/**
 * @param {import('css-tree').SelectorList} selectorListAst
 * @returns {Selector[]} Analyzed selectors in the selectorList
 */
function analyzeList(selectorListAst) {
	let childSelectors = []
	walk(selectorListAst, {
		visit: 'Selector',
		enter: function (node) {
			let c = getComplexity(node)
			childSelectors.push(c)
		}
	})

	return childSelectors
}

/**
 * Get the Complexity for the AST of a Selector Node
 * @param {import('css-tree').Selector} selector - AST Node for a Selector
 * @return {[number, boolean]} - The numeric complexity of the Selector and whether it's prefixed or not
 */
export function getComplexity(selector) {
	let complexity = 0

	walk(selector, function (node) {
		if (node.type === 'Selector' || node.type === 'Nth') return

		complexity++

		if (node.type === "IdSelector"
			|| node.type === 'ClassSelector'
			|| node.type === 'PseudoElementSelector'
			|| node.type === 'TypeSelector'
			|| node.type === 'PseudoClassSelector'
		) {
			if (hasVendorPrefix(node.name)) {
				complexity++
			}
		}

		if (node.type === 'AttributeSelector') {
			if (Boolean(node.value)) {
				complexity++
			}
			if (hasVendorPrefix(node.name.name)) {
				complexity++
			}
			return this.skip
		}

		if (node.type === 'PseudoClassSelector') {
			let list = analyzeList(node)

			// Bail out for empty/non-existent :nth-child() params, for example
			if (list.length === 0) return

			list.forEach((c) => {
				complexity += c
			})
			return this.skip
		}
	})

	return complexity
}
