import { afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import stylelintPkg from 'stylelint/package.json' with { type: 'json' }

const [major, minor] = stylelintPkg.version.split('.').map(Number)
export const supportsReferenceFiles = major > 17 || (major === 17 && minor >= 9)

export function createFixtures(prefix: string): (name: string, content: string) => string {
	let tmp_dir: string | undefined

	afterEach(() => {
		if (tmp_dir) {
			fs.rmSync(tmp_dir, { recursive: true, force: true })
			tmp_dir = undefined
		}
	})

	return function write_fixture(name: string, content: string): string {
		if (!tmp_dir) {
			tmp_dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix))
		}
		const file_path = path.join(tmp_dir, name)
		fs.writeFileSync(file_path, content, 'utf8')
		return file_path
	}
}
