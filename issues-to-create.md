# Issues to create in projectwallace/stylelint-plugin

Copy each block below into the GitHub "New issue" form.

---

## 1

**Title:** New rule: no-import

**Body:**
Disallow all `@import` rules in a stylesheet.

The `css-code-quality` library penalizes any `@import` (10 points per occurrence) because imports block rendering. Stylelint's built-in `no-invalid-position-at-import-rule` and `no-duplicate-at-import-rules` only cover edge cases — there is no built-in rule that bans `@import` entirely.

**Violation:**
```css
@import url("foo.css");
```

**Visitor:** `AtRule` — fires immediately per node, no full-file context needed.

---

## 2

**Title:** New rule: max-file-size

**Body:**
Limit the total size of a stylesheet in bytes.

The `css-code-quality` library flags files exceeding 200 KB. No built-in stylelint rule covers this.

**Violation:** A stylesheet whose byte length exceeds the configured limit (default: 200,000 bytes).

**Visitor:** `OnceExit` — requires the full file to be parsed before measuring size.

---

## 3

**Title:** New rule: max-source-lines

**Body:**
Limit the number of source lines of code (non-blank, non-comment lines).

The `css-code-quality` library penalizes stylesheets exceeding 10,000 SLoC. No built-in stylelint rule covers this.

**Violation:** A stylesheet with more than the configured number of meaningful lines (default: 10,000).

**Visitor:** `OnceExit` — requires full traversal to count lines.

---

## 4

**Title:** New rule: max-embedded-content-size

**Body:**
Limit the total size of embedded content (data URIs, base64-encoded assets) in a stylesheet.

The `css-code-quality` library penalizes excessive embedded content since it significantly inflates file size. No built-in stylelint rule covers this.

**Violation:**
```css
.icon { background: url("data:image/png;base64,iVBOR..."); }
```

**Visitor:** `OnceExit` — must sum all embedded content across the file.

---

## 5

**Title:** New rule: max-comment-size

**Body:**
Limit the total byte size of comments in a stylesheet.

The `css-code-quality` library penalizes excessive comment volume (`floor(bytes / 250)`, max 10 pts). No built-in stylelint rule covers total comment size.

**Violation:** A stylesheet where the sum of all comment content exceeds the configured byte threshold.

**Visitor:** `OnceExit` — must accumulate comment sizes across the whole file.

---

## 6

**Title:** New rule: max-selector-uniqueness-ratio

**Body:**
Enforce a minimum uniqueness ratio across all selectors in a stylesheet.

The `css-code-quality` library requires at least 66% of selectors to be unique. Stylelint's `no-duplicate-selectors` only flags exact duplicates — this rule flags systemic duplication by ratio.

**Violation:** A file where more than 34% of selectors are repeated elsewhere.

**Visitor:** `OnceExit` — requires collecting all selectors before computing the ratio.

---

## 7

**Title:** New rule: max-declaration-uniqueness-ratio

**Body:**
Enforce a minimum uniqueness ratio across all declarations in a stylesheet.

The `css-code-quality` library requires at least 66% of declarations to be unique. Stylelint's `declaration-block-no-duplicate-properties` only flags duplicates within a single block — this rule catches file-wide repetition by ratio.

**Violation:** A file where more than 34% of property-value pairs are repeated.

**Visitor:** `OnceExit` — requires collecting all declarations before computing the ratio.

---

## 8

**Title:** New rule: max-selectors-per-rule

**Body:**
Limit the number of selectors in a single rule.

The `css-code-quality` library flags rules with more than 10 selectors. No built-in stylelint rule enforces this limit.

**Violation:**
```css
a, b, c, d, e, f, g, h, i, j, k { color: red; }
```

**Visitor:** `Rule` — fires per rule node, no full-file context needed.

---

## 9

**Title:** New rule: max-declarations-per-rule

**Body:**
Limit the number of declarations in a single rule.

The `css-code-quality` library flags rules with more than 10 declarations. Stylelint's `declaration-block-single-line-max-declarations` only applies to single-line blocks — this rule applies universally.

**Violation:**
```css
a { color: red; font-size: 1rem; /* ... 9+ more declarations */ }
```

**Visitor:** `Rule` — fires per rule node, no full-file context needed.

---

## 10

**Title:** New rule: max-average-selectors-per-rule

**Body:**
Limit the mean number of selectors per rule across the stylesheet.

The `css-code-quality` library penalizes stylesheets where the average exceeds 2 selectors per rule. No built-in stylelint rule covers averages.

**Violation:** A stylesheet where the mean selectors-per-rule exceeds the configured threshold (default: 2).

**Visitor:** `OnceExit` — requires all rules to be visited before computing the mean.

---

## 11

**Title:** New rule: max-average-declarations-per-rule

**Body:**
Limit the mean number of declarations per rule across the stylesheet.

The `css-code-quality` library penalizes stylesheets where the average exceeds 5 declarations per rule. No built-in stylelint rule covers averages.

**Violation:** A stylesheet where the mean declarations-per-rule exceeds the configured threshold (default: 5).

**Visitor:** `OnceExit` — requires all rules to be visited before computing the mean.

---

## 12

**Title:** New rule: selector-count-distribution

**Body:**
Flag stylesheets where too many rules deviate above the most common (modal) selector count.

The `css-code-quality` library penalizes when more than 10% of rules have more selectors than the modal count. No built-in stylelint rule covers statistical distribution.

**Violation:** A stylesheet where more than 10% of rules have an above-modal number of selectors.

**Visitor:** `OnceExit` — requires all rules to compute the mode and count outliers.

---

## 13

**Title:** New rule: declaration-count-distribution

**Body:**
Flag stylesheets where too many rules deviate above the most common (modal) declaration count.

The `css-code-quality` library penalizes when more than 10% of rules have more declarations than the modal count. No built-in stylelint rule covers statistical distribution.

**Violation:** A stylesheet where more than 10% of rules have an above-modal number of declarations.

**Visitor:** `OnceExit` — requires all rules to compute the mode and count outliers.

---

## 14

**Title:** New rule: max-selector-complexity

**Body:**
Limit the complexity score of individual selectors.

Selector complexity is a numeric score based on combinators, pseudo-classes, attributes, etc. The `css-code-quality` library flags any selector with complexity > 5. Existing rules like `selector-max-compound-selectors` limit individual parts, not a composite score.

**Violation:**
```css
a b c d e f { color: red; } /* deep descendant chain = high complexity */
```

**Visitor:** `Rule` — fires per rule node, no full-file context needed.

---

## 15

**Title:** New rule: max-average-selector-complexity

**Body:**
Limit the mean selector complexity score across the stylesheet.

The `css-code-quality` library penalizes stylesheets where mean selector complexity exceeds 2. No built-in stylelint rule covers average complexity.

**Violation:** A stylesheet where the mean complexity score across all selectors exceeds the configured threshold (default: 2).

**Visitor:** `OnceExit` — requires all selectors to be visited before computing the mean.

---

## 16

**Title:** New rule: selector-complexity-distribution

**Body:**
Flag stylesheets where too many selectors deviate above the modal complexity score.

The `css-code-quality` library penalizes when more than 10% of selectors exceed the modal complexity. No built-in stylelint rule covers statistical distribution of complexity scores.

**Violation:** A stylesheet where more than 10% of selectors have above-modal complexity scores.

**Visitor:** `OnceExit` — requires all selectors to compute the mode and count outliers.

---

## 17

**Title:** New rule: selector-specificity-distribution

**Body:**
Flag stylesheets where too many selectors deviate above the modal specificity.

The `css-code-quality` library penalizes when more than 10% of selectors have specificity above the mode. Stylelint's `selector-max-specificity` sets a hard cap — this rule flags distribution outliers relative to the stylesheet's own baseline.

**Violation:** A stylesheet where more than 10% of selectors have above-modal specificity values.

**Visitor:** `OnceExit` — requires all selectors to compute the modal specificity and count outliers.

---

## 18

**Title:** New rule: max-id-selector-ratio

**Body:**
Limit the ratio of ID selectors relative to all selectors in the stylesheet.

The `css-code-quality` library penalizes when ID selectors exceed 1% of all selectors. Stylelint's `selector-max-id` limits the number of `#id` parts within a single selector — this rule enforces a file-wide ratio instead.

**Violation:** A stylesheet where more than 1% of all selectors include an ID selector.

**Visitor:** `OnceExit` — requires counting all selectors across the file.

---

## 19

**Title:** New rule: max-important-ratio

**Body:**
Limit the ratio of `!important` declarations relative to all declarations.

The `css-code-quality` library penalizes when `!important` exceeds 1% of all declarations. Stylelint's `declaration-no-important` is a hard ban — this rule allows occasional use but flags overuse by ratio.

**Violation:** A stylesheet where more than 1% of declarations use `!important`.

**Visitor:** `OnceExit` — requires counting all declarations across the file.
