import React, {
	useRef,
	useState,
	useEffect,
	useMemo,
	useCallback
} from 'react';
import Lodash from 'lodash';

/**
 * @param cmp if not defined, lodash.isEqual is used by default.
 */
export function useCmpState<S>(
	initv: S, cmp?: ((a: S, b: S) => boolean)
) {
	const cmpfn = cmp ?? Lodash.isEqual;
	const [sv, setSv] = useState<S>(initv);
	const setSvEx = useRef((v: S | ((prev: S) => S)) => {
		setSv(_v => {
			const newv = 'function' === (typeof v) ? (v as any)(_v) : v;
			return cmpfn(_v, newv) ? _v : newv;
		});
	});
	return [sv, setSvEx.current] as [S, React.Dispatch<React.SetStateAction<S>>];
}

export function useDbgState<S>(
	initv: S, tag: string
) {
	const [sv, setSv] = useState<S>(initv);
	const setSvEx = useRef((v: S | ((prev: S) => S)) => {
		setSv(_v => {
			const newv ='function' === (typeof v) ? (v as any)(_v) : v;
			const eq = (_v === newv) ? 'SAME' : 'DIFF';
			console.log(`[${tag}] <${eq}> `, v);
			return newv;
		});
	});
	return [sv, setSvEx.current] as [S, React.Dispatch<React.SetStateAction<S>>];
}

export function useForceRender(deps: any[] = []): () => void {
	const [_, _set] = useState(0);
	const rerender = useCallback(() => _set(n => n + 1)
		, []);
	useEffect(() => rerender()
	// eslint-disable-next-line react-hooks/exhaustive-deps
		, [rerender, ...deps]);
	return rerender;
}
