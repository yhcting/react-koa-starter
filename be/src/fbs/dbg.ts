
export const enum DLv {
	FATAL = 0,
	ERROR,
	WARN,
	INFO,
	DEBUG,
	VERBOSE
};

/**
 * "Browser(Chrome) log-level" : "App debug level"
 * <Error>   : 0: fatal, 1: error
 * <Warnings>: 2: warn,
 * <Info>    : 3: info, 4: debug,
 * <Verbose> : 5: verbose
 */
export function dbg(lv: DLv) {
	return {
		lv,
		f: (cond: any, ...message: any[]) => console.assert(cond, ...message),
		e: lv > DLv.FATAL ? console.error: (...args: any[]) => {},
		w: lv > DLv.ERROR ? console.warn: (...args: any[]) => {},
		i: lv > DLv.WARN ? console.info: (...args: any[]) => {},
		d: lv > DLv.INFO ? console.log: (...args: any[]) => {},
		v: lv > DLv.DEBUG ? console.debug: (...args: any[]) => {},

		// enable if debug level is high enough
		x: lv > DLv.WARN
			? (o: (...args: any[]) => any, ...args: any[]) => o(...args)
			: (o: (...args: any[]) => any, ...args: any[]) => {}
	};
}

export default dbg;
