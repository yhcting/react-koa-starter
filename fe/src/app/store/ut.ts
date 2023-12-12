// This is cyclic import! But, it refers only type. So, it's ok.
import { State as AppState } from './index';

export function mapStateFactory<
	P extends {[k: string]: any},
	T extends Partial<P> = P
>(
	selector: {[K in keyof P]},
) {
	/**
	 * @param state
	 * @param includes default: all
	 * @param excludes default: non
	 */
	return (
		state: AppState,
		includes?: Array<keyof P>,
		excludes?: Array<keyof P>
	): T => {
		const inc = new Set(includes ?? Object.keys(selector));
		const exc = new Set(excludes ?? [] as string[]);
		return Object.keys(selector).reduce((a, k) => {
			if (inc.has(k) && !exc.has(k)) {
				a[k as keyof T] = selector[k](state);
			}
			return a;
		}, {} as T);
	};
};
