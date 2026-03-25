# Claude instructions

Always follow the guidelines in `CONTRIBUTING.md` when making changes to this codebase. In particular, when adding a new rule:

1. Create `src/rules/<rule-name>/index.ts`, `index.test.ts`, and `README.md`
2. Register the rule in `src/index.ts` and update `src/index.test.ts`
3. Add the rule to the **Manual configuration** example and **Rules** table in `README.md`
4. Consider adding the rule to `src/configs/recommended.ts` (and/or other configs)
