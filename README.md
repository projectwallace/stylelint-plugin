# @projectwallace/stylelint-plugin

A stylelint plugin that checks the complexity of your CSS.

> Only use this plugin with standard CSS. Non-standard CSS (Sass, Less, etc.) is not supported.

## Installation

```sh
npm install --save-dev @projectwallace/stylelint-plugin
```

## Usage

### Using a preset config (recommended)

The easiest way to get started is by extending one of the preset configs:

**`recommended`** — enables all rules with sensible defaults:

```json
{
	"extends": ["@projectwallace/stylelint-plugin/configs/recommended"]
}
```

**`performance`** — enables only the rules that affect file size and loading performance:

```json
{
	"extends": ["@projectwallace/stylelint-plugin/configs/performance"]
}
```

**`maintainability`** — enables rules that limit complexity and enforce conventions to keep CSS easy to reason about and manage over time:

```json
{
	"extends": ["@projectwallace/stylelint-plugin/configs/maintainability"]
}
```

**`design-tokens`** — enables rules that encourage the use of design tokens in your CSS:

```json
{
	"extends": ["@projectwallace/stylelint-plugin/configs/design-tokens"]
}
```

### Manual configuration

Alternatively, add the plugin and configure rules individually in your stylelint config:

```json
{
	"plugins": ["@projectwallace/stylelint-plugin"],
	"rules": {
		"projectwallace/max-average-declarations-per-rule": 5,
		"projectwallace/max-average-selector-complexity": 2,
		"projectwallace/max-average-selectors-per-rule": 2,
		"projectwallace/max-average-specificity": [0, 2.5, 1],
		"projectwallace/max-comment-size": 2500,
		"projectwallace/max-embedded-content-size": 10000,
		"projectwallace/max-file-size": 200000,
		"projectwallace/max-important-ratio": 1,
		"projectwallace/max-declarations-per-rule": 15,
		"projectwallace/max-lines-of-code": 200,
		"projectwallace/max-selector-complexity": 5,
		"projectwallace/max-selectors-per-rule": 10,
		"projectwallace/max-unique-colors": 5,
		"projectwallace/max-unique-font-families": 4,
		"projectwallace/max-unique-units": 5,
		"projectwallace/min-declaration-uniqueness-ratio": 0.5,
		"projectwallace/min-selector-uniqueness-ratio": 0.66,
		"projectwallace/no-anonymous-layers": true,
		"projectwallace/no-duplicate-data-urls": true,
		"projectwallace/no-property-browserhacks": true,
		"projectwallace/no-static-container-query": true,
		"projectwallace/no-static-media-query": true,
		"projectwallace/no-undeclared-container-names": true,
		"projectwallace/no-unknown-custom-property": true,
		"projectwallace/no-unreachable-media-conditions": true,
		"projectwallace/no-unused-container-names": true,
		"projectwallace/no-unused-custom-properties": true,
		"projectwallace/no-unused-layers": true,
		"projectwallace/no-invalid-z-index": true,
		"projectwallace/no-property-shorthand": true,
		"projectwallace/no-useless-custom-property-assignment": true
	}
}
```

## Rules

| Rule                                                                                               | Description                                                                |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| [max-average-declarations-per-rule](src/rules/max-average-declarations-per-rule/README.md)         | Limit the average number of declarations per rule across the stylesheet    |
| [max-average-selector-complexity](src/rules/max-average-selector-complexity/README.md)             | Limit the average selector complexity across the stylesheet                |
| [max-average-selectors-per-rule](src/rules/max-average-selectors-per-rule/README.md)               | Limit the average number of selectors per rule across the stylesheet       |
| [max-average-specificity](src/rules/max-average-specificity/README.md)                             | Limit the average specificity across the stylesheet                        |
| [max-declarations-per-rule](src/rules/max-declarations-per-rule/README.md)                         | Limit the number of declarations in a single rule                          |
| [max-comment-size](src/rules/max-comment-size/README.md)                                           | Limit the total byte size of comments in a stylesheet                      |
| [max-embedded-content-size](src/rules/max-embedded-content-size/README.md)                         | Limit the total byte size of embedded content (data URIs) in a stylesheet  |
| [max-file-size](src/rules/max-file-size/README.md)                                                 | Limit the total byte size of a stylesheet                                  |
| [max-important-ratio](src/rules/max-important-ratio/README.md)                                     | Limit the ratio of `!important` declarations relative to all declarations  |
| [max-lines-of-code](src/rules/max-lines-of-code/README.md)                                         | Prevent a stylesheet from exceeding a predefined number of lines of code   |
| [max-selector-complexity](src/rules/max-selector-complexity/README.md)                             | Prevent selector complexity from going over a predefined maximum           |
| [max-selectors-per-rule](src/rules/max-selectors-per-rule/README.md)                               | Limit the number of selectors in a single rule                             |
| [max-unique-colors](src/rules/max-unique-colors/README.md)                                         | Limit the number of unique color values used across the stylesheet         |
| [max-unique-font-families](src/rules/max-unique-font-families/README.md)                           | Limit the number of unique font families used across the stylesheet        |
| [max-unique-units](src/rules/max-unique-units/README.md)                                           | Limit the number of unique CSS units used across the stylesheet            |
| [min-declaration-uniqueness-ratio](src/rules/min-declaration-uniqueness-ratio/README.md)           | Enforce a minimum ratio of unique declarations across the stylesheet       |
| [min-selector-uniqueness-ratio](src/rules/min-selector-uniqueness-ratio/README.md)                 | Enforce a minimum ratio of unique selectors across the stylesheet          |
| [no-anonymous-layers](src/rules/no-anonymous-layers/README.md)                                     | Disallow anonymous (unnamed) `@layer` blocks                               |
| [no-duplicate-data-urls](src/rules/no-duplicate-data-urls/README.md)                               | Disallow the same data URL from being used more than once                  |
| [no-property-browserhacks](src/rules/no-property-browserhacks/README.md)                           | Prevent the use of known browserhacks for properties                       |
| [no-unknown-container-names](src/rules/no-unknown-container-names/README.md)                       | Disallow container names in `@container` that were never declared          |
| [no-unknown-custom-property](src/rules/no-unknown-custom-property/README.md)                       | Disallow the use of undeclared custom properties in a `var()`              |
| [no-useless-custom-property-assignment](src/rules/no-useless-custom-property-assignment/README.md) | Disallow custom property assignments that reference themselves via `var()` |
| [no-unused-container-names](src/rules/no-unused-container-names/README.md)                         | Disallow container names that are declared but never queried               |
| [no-unused-custom-properties](src/rules/no-unused-custom-properties/README.md)                     | Disallow custom properties that are never used in a `var()`                |
| [no-static-container-query](src/rules/no-static-container-query/README.md)                         | Disallow static (exact-match) numeric container feature conditions         |
| [no-static-media-query](src/rules/no-static-media-query/README.md)                                 | Disallow static (exact-match) numeric media feature conditions             |
| [no-unreachable-media-conditions](src/rules/no-unreachable-media-conditions/README.md)             | Disallow media queries with contradictory conditions that can never match  |
| [no-invalid-z-index](src/rules/no-invalid-z-index/README.md)                                       | Disallow `z-index` values that are not valid 32-bit integers               |
| [no-property-shorthand](src/rules/no-property-shorthand/README.md)                                 | Disallow the use of shorthand properties                                   |
| [no-unused-layers](src/rules/no-unused-layers/README.md)                                           | Disallow `@layer` names that are declared but never implemented            |

## Credits

The `importFrom` option on [no-unknown-custom-property](src/rules/no-unknown-custom-property/README.md) and [no-unused-custom-properties](src/rules/no-unused-custom-properties/README.md) was inspired by the `importFrom` option in [csstools/postcss-custom-properties](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-custom-properties).

## License

MIT
