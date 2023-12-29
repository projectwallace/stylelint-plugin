import stylelint from "stylelint";
import { analyze } from '../../analyzer.modern.js'

const { createPlugin, utils } = stylelint;

const rule_name = "project-wallace/max-lines-of-code";

const messages = utils.ruleMessages(rule_name, {
	rejected: ({ actual, expected }) => `Counted ${actual} Lines of Code which is greater than the allowed ${expected}`,
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
			check: (value) => Number.isInteger(value) && value > 0,
		});

		if (!validOptions) {
			return;
		}

		if (primaryOption <= 0) {
			return
		}

		let analysis = analyze(root.source.input.css)
		let actual = analysis.stylesheet.sourceLinesOfCode

		if (actual > primaryOption) {
			utils.report({
				message: messages.rejected({ expected: primaryOption, actual }),
				node: root,
				result,
				ruleName: rule_name,
			});
		}
	};
};

ruleFunction.ruleName = rule_name;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(rule_name, ruleFunction);
