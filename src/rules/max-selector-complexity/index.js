import stylelint from "stylelint";
import { parse_selector } from '@projectwallace/css-parser'
import { selectorComplexity } from '@projectwallace/css-analyzer'

const { createPlugin, utils } = stylelint;

const rule_name = "project-wallace/max-selector-complexity";

const messages = utils.ruleMessages(rule_name, {
	rejected: ({ selector, actual, expected }) =>
		`Selector complexity of "${selector}" is ${actual} which is greater than the allowed ${expected}`,
});

const meta = {
	url: "https://github.com/projectwallace/stylelint-plugins",
};

/** @type {import('stylelint').Rule<string>} */
const ruleFunction = (primaryOption) => {
	return (root, result) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			allowEmpty: false,
			possible: [Number],
			check: (value) => Number.isInteger(value) && value > 1,
		});

		if (!validOptions) {
			return;
		}

		root.walkRules((rule) => {
			const selector = rule.selector;
			let parsed = parse_selector(selector)

			for (let sel of parsed.children) {
				const complexity = selectorComplexity(sel)
				let stringified = sel.text.replace(/\n/g, '')

				if (complexity > primaryOption) {
					utils.report({
						message: messages.rejected({ selector: stringified, expected: primaryOption, actual: complexity }),
						node: rule, // TODO: only report the selector
						result,
						ruleName: rule_name,
					});
				}
			}
		});
	};
};

ruleFunction.ruleName = rule_name;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(rule_name, ruleFunction);
