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
		"projectwallace/no-undeclared-container-names": true,
		"projectwallace/no-unreachable-media-conditions": true,
		"projectwallace/no-unused-container-names": true,
		"projectwallace/no-unused-custom-properties": true,
		"projectwallace/no-anonymous-layers": true,
		"projectwallace/no-unused-layers": true
	}
}
```

## Rules

| Rule                                                                                               | Description                                                                |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [max-lines-of-code](src/rules/max-lines-of-code/README.md)                                         | Prevent a stylesheet from exceeding a predefined number of lines of code   |
| [no-anonymous-layers](src/rules/no-anonymous-layers/README.md)                                     | Disallow anonymous (unnamed) `@layer` blocks                               |
| [max-selector-complexity](src/rules/max-selector-complexity/README.md)                             | Prevent selector complexity from going over a predefined maximum           |
| [no-property-browserhacks](src/rules/no-property-browserhacks/README.md)                           | Prevent the use of known browserhacks for properties                       |
| [no-undeclared-container-names](src/rules/no-undeclared-container-names/README.md)                 | Disallow container names in `@container` that were never declared          |
| [no-unknown-custom-property](src/rules/no-unknown-custom-property/README.md)                       | Disallow the use of undeclared custom properties in a `var()`              |
| [no-useless-custom-property-assignment](src/rules/no-useless-custom-property-assignment/README.md) | Disallow custom property assignments that reference themselves via `var()` |
| [no-unused-container-names](src/rules/no-unused-container-names/README.md)                         | Disallow container names that are declared but never queried               |
| [no-unused-custom-properties](src/rules/no-unused-custom-properties/README.md)                     | Disallow custom properties that are never used in a `var()`                |
| [no-unreachable-media-conditions](src/rules/no-unreachable-media-conditions/README.md)             | Disallow media queries with contradictory conditions that can never match  |
| [no-unused-layers](src/rules/no-unused-layers/README.md)                                           | Disallow `@layer` names that are declared but never defined                |

## License

MIT
