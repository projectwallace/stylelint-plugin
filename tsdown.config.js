import { defineConfig } from 'tsdown'

export default defineConfig({
	entry: './src/index.js',
	format: ['esm'],
	platform: 'node',
	dts: false,
})
