import stylelint from "stylelint";
import { isPropertyHack } from '../../analyzer.modern.js'

const { createPlugin, utils } = stylelint;

const rule_name = "project-wallace/no-property-browserhacks";

const messages = utils.ruleMessages(rule_name, {
	rejected: (property) =>
		`Property "${property}" is a browserhack and is not allowed`,
});

const meta = {
	url: "https://github.com/projectwallace/stylelint-plugins",
};

/** @type {import('stylelint').Rule<string>} */
const ruleFunction = (primaryOption) => {
	return (root, result) => {
		const validOptions = utils.validateOptions(result, rule_name, {
			actual: primaryOption,
			possible: [true],
		});

		if (!validOptions) {
			return null;
		}

		root.walkDecls((declaration) => {
			// PostCSS strips *_ etc. from the property name, so we need to get the original property from the source
			let full_declaration = root.source.input.css.substring(declaration.source.start.offset, declaration.source.end.offset)
			let property = full_declaration.substring(0, full_declaration.indexOf(':')).trim()

			if (isPropertyHack(property)) {
				utils.report({
					message: `Property "${property}" is a browserhack and is not allowed`,
					node: declaration,
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
