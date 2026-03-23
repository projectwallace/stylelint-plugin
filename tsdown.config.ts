import { defineConfig } from 'tsdown'
import { codecovRollupPlugin } from '@codecov/rollup-plugin'

export default defineConfig({
	entry: {
		index: './src/index.ts',
		'configs/recommended': './src/configs/recommended.ts',
		'configs/performance': './src/configs/performance.ts',
	},
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
