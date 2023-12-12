import winston from 'winston';
import process from 'process';

import cfg from '../config';
import { E, ethrow } from './error';


export enum Level {
	FATAL = 1,
	ERROR,
	WARN,
	INFO,
	DEBUG,
	VERBOSE
}

const defaultLogLv = Number(process.env.LOG_LEVEL)
	|| (cfg.prod ? Level.INFO : Level.DEBUG);

const winstonLogger = winston.createLogger({
	level: 'silly',
	transports: [
		new (winston.transports.Console)()
	]
});

const pid = process.pid;
let micntr_ = 0; // Monolithic Increasing CouNTeR
function micntr() {
	return micntr_++;
}

class Logger {
	protected logger: winston.Logger;
	constructor(
		protected readonly prefix: string,
		protected readonly lv: Level,
	) {
		this.logger = winstonLogger;
	}

	private isDevMode() {
		return this.lv > Level.INFO;
	}

	// logging functions
	lg(lv: Level, ...args: any[]) {
		if (lv > this.lv) { return; }
		const tm = Date.now();
		/*
		const msgs: string[] = [];
		for (const arg of args) {
			if ('string' !== typeof arg) {
				msgs.push(JSON.stringify(arg, undefined, 2));
			}
		}
		const logmsg = `[${tm}] ${msgs.join(' ')}`;
		// (<any>this.logger)['silly'](logmsg);
		*/
		console.log(`[${pid}][${tm}]`, ...args);
	}

	// debugging execution
	ex(lv: Level, f: () => any) {
		if (lv > this.lv) { return; }
		f();
	}

	// Time duration logging.
	async tm<T>(lv: Level, msg: string, f: () => T | Promise<T>): Promise<T> {
		const id = micntr();
		let tm = -Date.now();
		this.lg(lv, `<${id}> >>> ${msg}`);
		try {
			return await f();
		} finally {
			tm += Date.now();
			this.lg(lv, `<${id}> <<< ${msg} (${tm}ms)`);
		}
	}

	tmv<T>(msg: string, f: () => T | Promise<T>) { return this.tm(Level.VERBOSE, msg, f); }
	tmd<T>(msg: string, f: () => T | Promise<T>) { return this.tm(Level.DEBUG, msg, f); }
	tmi<T>(msg: string, f: () => T | Promise<T>) { return this.tm(Level.INFO, msg, f); }
	tmw<T>(msg: string, f: () => T | Promise<T>) { return this.tm(Level.WARN, msg, f); }

	exv(f: () => void | Promise<void>) { return this.ex(Level.VERBOSE, f); }
	exd(f: () => void | Promise<void>) { return this.ex(Level.DEBUG, f); }
	exi(f: () => void | Promise<void>) { return this.ex(Level.INFO, f); }
	exw(f: () => void | Promise<void>) { return this.ex(Level.WARN, f); }

	v(...args: any[]) { this.lg(Level.VERBOSE, ...args); }
	d(...args: any[]) { this.lg(Level.DEBUG, ...args); }
	i(...args: any[]) { this.lg(Level.INFO, ...args); }
	w(...args: any[]) { this.lg(Level.WARN, ...args); }
	/**
	 * Message is printed. And then assert.
	 */
	e(...args: any[]): void {
		this.lg(Level.ERROR, ...args);
		if (this.lv >= Level.ERROR) {
			ethrow(E.assert);
		}
	}

	/**
	 * Message is printed to stderr. And process is exited
	 */
	fatal(message?: any, err?: any, exitcode=1): never {
		// DO NOT USE winston logger here!
		console.error(`FATAL: ${this.prefix} ${message || ''}`);
		console.error(err ?? '');
		console.trace();
		// Exit immeidately!
		return process.exit(exitcode);
	}

	assert(cond: any, message?: any): void {
		if (!cond) {
			this.e(message ?? 'ASSERT');
			// Always throw assert regardless of log-level
			ethrow(E.assert);
		}
	}

	assertFatal(cond: any, message?: any): void {
		if (!cond) {
			this.fatal(message ?? 'ASSERT-FATAL');
		}
	}

	async mustNotFail<T>(
		f: () => T | Promise<T>,
		logOnFail?: string
	): Promise<T> {
		try {
			return await f();
		} catch (e) {
			return this.fatal(logOnFail || '', e);
		}
	}
}

export function newLogger(m: NodeModule, level = defaultLogLv): Logger {
	// [TODO]
	// Write code for centralized control regarding logging, here!
	// At this moment, all loggings are allowed.
	const prefix = m ? m.filename.split('/').slice(-1).join('') : '';
	return new Logger(prefix, level);
}

//////////////////////////////////////////////////////////////////////////////
//
// Log decorator
//
//////////////////////////////////////////////////////////////////////////////
/**
 * Method Decorator
 */
export function tmlog(logger: Logger, lv = defaultLogLv, tag?: string) {
	return (target: any, key: string | symbol, descriptor: TypedPropertyDescriptor<any>) => {
		if (undefined === descriptor) {
			descriptor = Object.getOwnPropertyDescriptor(target, key);
		}
		const orig = descriptor.value;
		descriptor.value = function () {
			tag = tag ? `[${tag}]` : '';
			const id = micntr();
			logger.lg(lv, `@@@ <${id}> >>> ${key.toString()} ${tag}`);
			let tm = -Date.now();
			const r = orig.apply(this, arguments);
			if (r instanceof Promise) {
				return r.finally(() => {
					tm += Date.now();
					logger.lg(lv, `@@@ <${id}> <<< ${key.toString()} ${tag} (${tm}ms)`);
				});
			} else {
				tm += Date.now();
				logger.lg(lv, `@@@ <${id}> <<< ${key.toString()} ${tag} (${tm}ms)`);
				return r;
			}
		};
		return descriptor;
	};
}
