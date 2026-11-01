import type { Config } from 'stylelint'

export type PresetConfig = {
	plugins: string[]
	rules: NonNullable<Config['rules']>
}
