import { defineConfig } from 'tsdown'
import { codecovRollupPlugin } from '@codecov/rollup-plugin'

export default defineConfig({
	entry: ['./src/index.ts', './src/configs/*.ts', '!./**/*.test.ts'],
	format: ['esm'],
	platform: 'node',
	dts: true,
	publint: true,
	plugins: [
		codecovRollupPlugin({
			enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
			bundleName: 'stylelintPlugin',
			uploadToken: process.env.CODECOV_TOKEN,
		}),
	],
})
