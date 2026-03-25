# Contributing

## Developing

Before committing, run the linter:

```sh
npm run lint
```

## Adding a new rule

1. Create a new folder under `src/rules/<rule-name>/` with the following files:
   - `index.ts` — the rule implementation
   - `index.test.ts` — tests for the rule
   - `README.md` — documentation (see [Rule README guidelines](#rule-readme-guidelines))
2. Register the rule in `src/index.ts`
3. Add the rule to the **Manual configuration** example and the **Rules** table in `README.md`
4. Consider adding the rule to one or more of the configuration presets in `src/configs/`
5. Use PostCSS API's as much as possible. Only if goals cannot be achieved reach for `@projectwallace/css-parser`

## Rule README guidelines

Every rule's `README.md` must:

- Show at least one example of a **violation** and one **passing** pattern
- Document all available options

Rules that disallow certain behaviour (e.g. `no-unused-x`, `no-undefined-x`) should implement a secondary `allowList` option. This option accepts an array of `string | RegExp` values and must be consistent across all rules that implement it. Use the shared `isAllowed(value, allowList)` utility from `src/utils/allow-list.ts` to evaluate it.

## Adding a new config

1. Create a new file under `src/configs/<config-name>.ts`
2. Add the config to the `exports` field in `package.json`:
   ```json
   "./configs/<config-name>": "./dist/configs/<config-name>.mjs"
   ```
3. Document the config in the **Usage** section of `README.md`
