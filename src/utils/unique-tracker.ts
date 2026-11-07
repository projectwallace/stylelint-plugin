/**
 * Tracks unique values against a maximum, for the `max-unique-*` rules.
 *
 * Call `begin()` before processing a node, `add()` for every value found in it, and
 * `exceeded()` afterwards to find out whether that node pushed the total over the limit.
 */
export class UniqueTracker {
	#values = new Set<string>()
	#limit: number
	#before = 0

	constructor(limit: number) {
		this.#limit = limit
	}

	get size(): number {
		return this.#values.size
	}

	has(value: string): boolean {
		return this.#values.has(value)
	}

	/** Start tracking a new node. */
	begin(): void {
		this.#before = this.#values.size
	}

	/**
	 * Add a value.
	 * @returns true if the value is new and brings the total above the limit
	 */
	add(value: string): boolean {
		if (this.#values.has(value)) {
			return false
		}
		this.#values.add(value)
		return this.#values.size > this.#limit
	}

	/** True if values added since `begin()` brought the total above the limit. */
	exceeded(): boolean {
		return this.#values.size > this.#before && this.#values.size > this.#limit
	}
}
