export function unquote(value: string): string {
	return value.replaceAll(/^['"]|['"]$/g, '')
}
