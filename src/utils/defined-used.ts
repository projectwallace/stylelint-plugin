/**
 * Tracks defined and used names with associated nodes, mirroring the
 * css-analyzer's DefinedUsed but storing a node reference per defined name.
 *
 * All define()/use() calls are O(1). The unused/unknown sets are maintained
 * incrementally, so the final iteration is O(m) over the actual violations
 * rather than O(n) over all defined/used items.
 */
export class DefinedUsed<Node> {
	#defined = new Map<string, Node>()
	#used = new Set<string>()
	#unused = new Map<string, Node>()
	#unknown = new Set<string>()

	define(name: string, node: Node): void {
		if (this.#defined.has(name)) return
		this.#defined.set(name, node)
		if (this.#used.has(name)) {
			this.#unknown.delete(name)
		} else {
			this.#unused.set(name, node)
		}
	}

	use(name: string): void {
		if (this.#used.has(name)) return
		this.#used.add(name)
		if (this.#defined.has(name)) {
			this.#unused.delete(name)
		} else {
			this.#unknown.add(name)
		}
	}

	get defined_size(): number {
		return this.#defined.size
	}

	unused(): IterableIterator<[string, Node]> {
		return this.#unused.entries()
	}

	unknown(): IterableIterator<string> {
		return this.#unknown.values()
	}
}
