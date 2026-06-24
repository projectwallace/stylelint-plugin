import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: ['./src/index.ts', './src/configs/*.ts', './src/rules/*/index.ts', '!./**/*.test.ts'],
	format: ['esm'],
	platform: 'node',
	dts: true,
	publint: true,
})
