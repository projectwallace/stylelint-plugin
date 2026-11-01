import { defineConfig, type UserConfig } from 'tsdown'

const config: UserConfig = defineConfig({
	entry: ['./src/index.ts', './src/configs/*.ts', './src/rules/*/index.ts', '!./**/*.test.ts'],
	format: ['esm'],
	platform: 'node',
	dts: true,
	publint: true,
})

export default config
