import stylelint from 'stylelint'
import type { Root } from 'postcss'
import { layer_tree, type Location, type TreeNode } from '@projectwallace/css-layer-tree'
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

interface FoundLayer {
	name: string
	location: Location
}

/** The first place a layer shows up. Implicit parents (`@layer a.b`) fall back to their children. */
function first_location(node: TreeNode): Location | undefined {
	return node.locations[0] ?? node.children.map(first_location).find(Boolean)
}

/** Flattens the tree into fully qualified layer names. Anonymous layers can't be referenced, so they are skipped. */
function collect(nodes: TreeNode[], scope: string, found: FoundLayer[]) {
	for (const node of nodes) {
		if (node.is_anonymous) {
			continue
		}
		const name = scope ? `${scope}.${node.name}` : node.name
		const location = first_location(node)
		if (location) {
			found.push({ name, location })
		}
		collect(node.children, name, found)
	}
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

		if (!validOptions) {
			return
		}

		const ignore = secondaryOptions?.ignore ?? []
		const found: FoundLayer[] = []
		collect(layer_tree(root.toString()), '', found)

		// In source order, so the reported layers are the ones that cross the limit first
		const layers = found
			.filter(({ name }) => !is_allowed(name, ignore))
			.sort((a, b) => a.location.start - b.location.start)

		for (const { location } of layers.slice(primaryOption)) {
			utils.report({
				message: messages.rejected(layers.length, primaryOption),
				node: root,
				index: location.start,
				endIndex: location.end,
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
