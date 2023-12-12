//////////////////////////////////////////////////////////////////////////////
// General untility functions
//////////////////////////////////////////////////////////////////////////////
/**
 * @param min inclusive
 * @param max exclusive
 */
export function randInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min) + min);
}

/**
 * Randomly pick one reflecting weights.
 * Weight MUST be larger than or equal 0.
 * Negative value is considered as 0.
 *
 * @param weights Weights
 * @return Index picked. -1 if nothing to pick.
 */
export function randPick(weights: number[]) {
	let ws = weights.map(v => v < 0 ? 0 : v);
	const sum = ws.reduce((v, a) => v + a, 0);
	if (0 === sum)
		return -1;

	ws = ws.map(v => v / sum);
	// Index of max-element
	const mi = ws.reduce((v, a, i) => v > ws[a] ? i : a, 0);
	if (0 >= ws[mi])
		return -1;

	let rv = Math.random();
	for (let i = 0; i < ws.length; i++) {
		rv -= ws[i];
		if (ws[i] > 0 && rv <= 0)
			return i;
	}
	// Fail to find due to FP(Floating point) precision error.
	// it is good way to minimize side-effect of FP precision error, picking
	// largest value.
	return mi;
}

/**
 * Shuffles array in place.
 * @param a items An array containing the items.
 */
export function shuffle(a: any[]) {
	let j: number;
	let x: number;
	let i: number;
	for (i = 0; i < a.length; i++) {
		j = Math.floor(Math.random() * a.length);
		x = a[i];
		a[i] = a[j];
		a[j] = x;
	}
	return a;
}

export function crop(v: number, min: number, max: number) {
	return v < min
		? min
		: v > max
			? max
			: v;
}

export function cropMin(v: number, min: number) {
	return crop(v, min, Number.POSITIVE_INFINITY);
}

export function cropMax(v: number, max: number) {
	return crop(v, Number.NEGATIVE_INFINITY, max);
}

/**
 * 'undefined' or 'null' are handled as empty Set.
 */
export function updateSet<T>(from: Set<T>, added: Set<T>, removed: Set<T>) {
	from = from ?? new Set();
	added = added ?? new Set();
	removed = removed ?? new Set();
	const s = new Set([...from, ...added]);
	for (const i of removed)
		s.delete(i);
	return s;
}

export function mergeSets<T>(sets: Iterable<Set<T>>) {
	const r = new Set<T>();
	for (const s of sets)
		for (const e of s)
			r.add(e);
	return r;
}

/**
 *  Shallow-clone given Map.
 *
 * @param src
 * @param vf Function to create value of map.
 */
export function cloneMap<K, V>(src: Map<K, V>, vf?: (v: V) => V) {
	const m = new Map(src); // shallow copy
	if (!vf) return m;
	for (const [k, v] of m.entries())
		m.set(k, vf(v));
	return m;
}

export function stat(d: number[]
): {m: number; /* mean */ v: number /* variation */} {
	const mean = d.reduce((s, n) => s + n, 0) / d.length;
	const variation = d.reduce(
		(s, n) => s + (mean - n) * (mean - n), 0) / d.length;
	return {m: mean, v: variation};
}

export function escapeRegExp(s: string) {
	return s.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export async function asyncForEach(
	o: any[] | Map<any, any> | Set<any> | IterableIterator<any>,
	callback: (value: any, key: any, o: any) => Promise<void>
) {
	if (Array.isArray(o)) {
		for (let i = 0; i < o.length; i++) {
			await callback(o[i], i, o);
		}
	} else if (o instanceof Map) {
		// Order is not matter in case of Map
		const proms: any[] = [];
		for (const [v, k] of o.entries()) {
			proms.push(callback(v, k, o));
		}
		await Promise.all(proms);
	} else if (o instanceof Set) {
		// Order is not matter in case of Set
		const proms: any[] = [];
		for (const v of o.values()) {
			proms.push(callback(v, v, o));
		}
		await Promise.all(proms);
	} else {
		// Order is matter in case of iterable
		for (const v of o) {
			await callback(v, v, o);
		}
	}
}
