// Just wrapper(composition) of window.localStorage for debugging in future

export const set: typeof window.localStorage.setItem
	= (k, v) => window.localStorage.setItem(k, v);
export const get: typeof window.localStorage.getItem
	= k => window.localStorage.getItem(k);
export const remove: typeof window.localStorage.removeItem
	= k => window.localStorage.removeItem(k);
export const clear: typeof window.localStorage.clear
	= () => window.localStorage.clear();
export const length = () => window.localStorage.length;
export const key: typeof window.localStorage.key
	= i => window.localStorage.key(i);
