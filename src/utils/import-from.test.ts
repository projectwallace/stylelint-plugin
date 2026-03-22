import { test, expect, afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { collect_declarations_from_files, collect_usages_from_files } from './import-from.js'

let tmp_dir: string

function setup_tmp_dir(): string {
	tmp_dir = fs.mkdtempSync(path.join(os.tmpdir(), 'import-from-test-'))
	return tmp_dir
}

function write_fixture(name: string, content: string): string {
	const dir = tmp_dir ?? setup_tmp_dir()
	const file_path = path.join(dir, name)
	fs.writeFileSync(file_path, content, 'utf8')
	return file_path
}

afterEach(() => {
	if (tmp_dir) {
		fs.rmSync(tmp_dir, { recursive: true, force: true })
		tmp_dir = undefined!
	}
})

// collect_declarations_from_files

test('collect_declarations_from_files: finds a custom property in a single file (string path)', () => {
	const file = write_fixture('vars.css', ':root { --color: red; }')
	const result = collect_declarations_from_files([file])
	expect(result.has('--color')).toBe(true)
	expect(result.size).toBe(1)
})

test('collect_declarations_from_files: accepts { filePath } object format', () => {
	const file = write_fixture('vars.css', ':root { --color: red; }')
	const result = collect_declarations_from_files([{ filePath: file }])
	expect(result.has('--color')).toBe(true)
	expect(result.size).toBe(1)
})

test('collect_declarations_from_files: finds multiple custom properties in a file', () => {
	const file = write_fixture('vars.css', ':root { --a: 1; --b: 2; --c: 3; }')
	const result = collect_declarations_from_files([file])
	expect(result.has('--a')).toBe(true)
	expect(result.has('--b')).toBe(true)
	expect(result.has('--c')).toBe(true)
	expect(result.size).toBe(3)
})

test('collect_declarations_from_files: finds @property declarations', () => {
	const file = write_fixture(
		'vars.css',
		`@property --my-color {
			syntax: '<color>';
			initial-value: red;
			inherits: false;
		}`,
	)
	const result = collect_declarations_from_files([file])
	expect(result.has('--my-color')).toBe(true)
	expect(result.size).toBe(1)
})

test('collect_declarations_from_files: merges declarations from multiple files', () => {
	const file1 = write_fixture('colors.css', ':root { --color: red; }')
	const file2 = write_fixture('spacing.css', ':root { --space: 8px; }')
	const result = collect_declarations_from_files([file1, file2])
	expect(result.has('--color')).toBe(true)
	expect(result.has('--space')).toBe(true)
	expect(result.size).toBe(2)
})

test('collect_declarations_from_files: later file wins when same property is declared twice', () => {
	const file1 = write_fixture('base.css', ':root { --color: red; }')
	const file2 = write_fixture('override.css', ':root { --color: blue; }')
	const result = collect_declarations_from_files([file1, file2])
	expect(result.has('--color')).toBe(true)
	expect(result.size).toBe(1)
})

test('collect_declarations_from_files: ignores regular (non-custom) properties', () => {
	const file = write_fixture('styles.css', 'a { color: red; font-size: 12px; }')
	const result = collect_declarations_from_files([file])
	expect(result.size).toBe(0)
})

test('collect_declarations_from_files: returns empty map for a file with no custom properties', () => {
	write_fixture('empty.css', 'a { color: red; }')
	const result = collect_declarations_from_files([])
	expect(result.size).toBe(0)
})

test('collect_declarations_from_files: returns empty map when given empty array', () => {
	const result = collect_declarations_from_files([])
	expect(result.size).toBe(0)
})

// collect_usages_from_files

test('collect_usages_from_files: finds a var() usage in a single file (string path)', () => {
	const file = write_fixture('component.css', 'a { color: var(--color); }')
	const result = collect_usages_from_files([file])
	expect(result.has('--color')).toBe(true)
	expect(result.size).toBe(1)
})

test('collect_usages_from_files: accepts { filePath } object format', () => {
	const file = write_fixture('component.css', 'a { color: var(--color); }')
	const result = collect_usages_from_files([{ filePath: file }])
	expect(result.has('--color')).toBe(true)
	expect(result.size).toBe(1)
})

test('collect_usages_from_files: finds multiple var() usages in a file', () => {
	const file = write_fixture('component.css', 'a { color: var(--color); font-size: var(--size); }')
	const result = collect_usages_from_files([file])
	expect(result.has('--color')).toBe(true)
	expect(result.has('--size')).toBe(true)
	expect(result.size).toBe(2)
})

test('collect_usages_from_files: merges usages from multiple files', () => {
	const file1 = write_fixture('a.css', 'a { color: var(--color); }')
	const file2 = write_fixture('b.css', 'b { font-size: var(--size); }')
	const result = collect_usages_from_files([file1, file2])
	expect(result.has('--color')).toBe(true)
	expect(result.has('--size')).toBe(true)
	expect(result.size).toBe(2)
})

test('collect_usages_from_files: deduplicates the same var() used across multiple files', () => {
	const file1 = write_fixture('a.css', 'a { color: var(--color); }')
	const file2 = write_fixture('b.css', 'b { background: var(--color); }')
	const result = collect_usages_from_files([file1, file2])
	expect(result.has('--color')).toBe(true)
	expect(result.size).toBe(1)
})

test('collect_usages_from_files: finds var() with fallback', () => {
	const file = write_fixture('component.css', 'a { color: var(--color, red); }')
	const result = collect_usages_from_files([file])
	expect(result.has('--color')).toBe(true)
})

test('collect_usages_from_files: returns empty set for a file with no var() usages', () => {
	const file = write_fixture('styles.css', 'a { color: red; }')
	const result = collect_usages_from_files([file])
	expect(result.size).toBe(0)
})

test('collect_usages_from_files: returns empty set when given empty array', () => {
	const result = collect_usages_from_files([])
	expect(result.size).toBe(0)
})
