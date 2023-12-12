import joi from 'joi';
import * as tychk from './tychk';

/**
 * Errors between FE and BE(API & IPC).
 * This is super-set of api and ipc errors
 */
export enum E {
	/** general unexpected error */
	assert = 'assert',
	unknown = 'unknown',
	external = 'external',
	unauthorized = 'unauthorized',
	notImplemented = 'notImplemented',
	/** already exist */
	exist = 'exist',
	notFound = 'notFound',
	database = 'database',
	badRequest = 'badRequest',
	permission = 'permission',
	authentication = 'authentication',
	/** This may be included at badRequest.(TBD) */
	forbidden = 'forbidden',
}

//////////////////////////////////////////////////////////////////////////////
//
// Why custom Err is used?
// See
//	 - https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md
//		#extending-built-ins-like-error-array-and-map-may-no-longer-work
//	 - https://stackoverflow.com/questions/30402287/extended-errors-do-not-have-message-or-stack-trace
//
//////////////////////////////////////////////////////////////////////////////
// DO NOT extends Error. See file-header-comments above.
// Even if we have workaround, to remove confusion and difference among
//	 target(es5, es6), custom class is ued.
export class Err<EC> {
	readonly stack: string | undefined; // This is 'non-enumerable'
	constructor(
		public code: EC,
		public message?: string,
		public body?: any /** additonal error data */
	) {
		// Object.setPrototypeOf(this, ErrBase.prototype);
		if (Error.hasOwnProperty('captureStackTrace')) {
			(Error as any).captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error()).stack;
		}
		Object.defineProperty(this, 'stack', {
			enumerable: true
		});
	}

	/**
	 * Check whether e is Err instance or not based on duck-typing.
	 */
	static isInstance(e: any) {
		return !joi.object({
			stack: joi.string().optional(),
			code: joi.string().required(),
			body: joi.any().optional()
		}).validate(e, {convert: false}).error;
	}

	toString(debug = false): string {
		let s = `Err: ${this.code || ''}`;
		if (this.message) {
			s += '\n' + this.message;
		}
		if (debug) {
			s += '\n' + this.stack;
		}
		return s;
	}
}

export function ethrow<EC>(e: EC, m?: string, body?: any): never {
	throw new Err(e, m, body);
}

/**
 * Assert Verification. Frequently used. So, name is simplified as 'a'.
 */
export function a<EC>(cond: any, e: EC, msg?: string, body?: any) {
	if (!cond) {
		throw new Err(e, msg, body);
	}
}

	/**
	 * Check whether e is Err instance or not based on duck-typing.
	 */
export function isErrInstance<R = Err<E>>(e: any): e is R {
	return tychk.validate(e, joi.object({
		stack: joi.string().optional(),
		code: joi.string().required(),
		message: joi.string().allow('').optional(),
		body: joi.any().optional()
	}));
}

