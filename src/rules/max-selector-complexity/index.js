import stylelint from "stylelint";
import { parse } from 'css-tree'
import { selectorComplexity } from '../../analyzer.modern.js'

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
			return;
		}

		root.walkRules((rule) => {
			const selector = rule.selector;
			let parsed = parse(selector, { context: 'selectorList', positions: true })

			for (let sel of parsed.children) {
				const complexity = selectorComplexity(sel)
				let stringified = selector.substring(sel.loc.start.offset, sel.loc.end.offset).replace(/\n/g, '')

				if (complexity > primaryOption) {
					utils.report({
						message: `Selector complexity of "${stringified}" is ${complexity} which is greater than the allowed ${primaryOption}`,
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
