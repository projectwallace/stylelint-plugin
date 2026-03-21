/**
 * Accumulates per-file values across a stylelint run so that rules can
 * enforce limits on the combined total rather than on individual files.
 *
 * Usage:
 *   const accumulator = new CrossFileAccumulator<number>()
 *   accumulator.update(filePath, fileValue)
 *   const total = accumulator.values().reduce((a, b) => a + b, 0)
 *   accumulator.reset() // call in tests between lint runs
 */
export class CrossFileAccumulator<T> {
	private readonly store = new Map<string, T>()

	/** Record (or overwrite) the value for a given file path. */
	update(filePath: string, value: T): void {
		this.store.set(filePath, value)
	}

	/** Return all accumulated values. */
	values(): T[] {
		return [...this.store.values()]
	}

	/** Clear all accumulated state. Call this between lint runs in tests. */
	reset(): void {
		this.store.clear()
	}
}
