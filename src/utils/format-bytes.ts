const byte_units = ['byte', 'kilobyte', 'megabyte'] as const

export function format_filesize(bytes: number): string {
	const abs = Math.abs(bytes)

	const exponent = abs < 1 ? 0 : Math.min(Math.floor(Math.log10(abs) / 3), byte_units.length - 1)

	const value = abs === 0 ? 0 : abs / Math.pow(1000, exponent)
	const unit = byte_units[exponent]
	const suffix = unit === 'byte' && value !== 1 ? 's' : ''

	return (
		new Intl.NumberFormat(undefined, {
			style: 'unit',
			unit: byte_units[exponent],
			unitDisplay: 'short',
			maximumSignificantDigits: 3,
		}).format(value) + suffix
	)
}
