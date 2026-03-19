# @projectwallace/stylelint-plugin

A stylelint plugin that checks the complexity of your CSS.

> Only use this plugin with standard CSS. Non-standard CSS (Sass, Less, etc.) is not supported.

## Installation

```sh
npm install --save-dev @projectwallace/stylelint-plugin
```

## Usage

Add the plugin and configure rules in your stylelint config:

```json
{
	"plugins": ["@projectwallace/stylelint-plugin"],
	"rules": {
		"projectwallace/max-lines-of-code": 200,
		"projectwallace/max-selector-complexity": 5,
		"projectwallace/no-property-browserhacks": true,
		"projectwallace/no-unused-custom-properties": true
	}
}
```

## Rules

| Rule                                                                           | Description                                                              |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| [max-lines-of-code](src/rules/max-lines-of-code/README.md)                     | Prevent a stylesheet from exceeding a predefined number of lines of code |
| [max-selector-complexity](src/rules/max-selector-complexity/README.md)         | Prevent selector complexity from going over a predefined maximum         |
| [no-property-browserhacks](src/rules/no-property-browserhacks/README.md)       | Prevent the use of known browserhacks for properties                     |
| [no-unknown-custom-property](src/rules/no-unknown-custom-property/README.md)   | Disallow the use of undeclared custom properties in a `var()`            |
| [no-unused-custom-properties](src/rules/no-unused-custom-properties/README.md) | Disallow custom properties that are never used in a `var()`              |

## License

MIT
