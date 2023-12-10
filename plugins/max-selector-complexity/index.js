import stylelint from "stylelint";
import { parse } from 'css-tree'
import { getComplexity } from "./complexity.js";

const { createPlugin, utils } = stylelint;

const rule_name = "project-wallace/max-selector-complexity";

const messages = utils.ruleMessages(rule_name, {
	rejected: (property) =>
		`"${property}" was declared but never used in a var()`,
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
			return null;
		}

		root.walkRules((rule) => {
			const selector = rule.selector;
			let parsed = parse(selector, { context: 'selector' })
			const selectorComplexity = getComplexity(parsed)

			if (selectorComplexity > primaryOption) {
				utils.report({
					message: `Selector complexity of "${selector}" is ${selectorComplexity} which is greater than the allowed ${primaryOption}`,
					node: rule,
					result,
					ruleName: rule_name,
				});
			}
		});
	};
};

ruleFunction.ruleName = rule_name;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(rule_name, ruleFunction);
