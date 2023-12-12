import { Err as ErrBase } from '../fbs/error';
import { E as FbsE } from '../fbs/error';
import { E as BeE } from '../fbs/dto/cmmn';

export enum FeE {
	assert = 'assert',
	notImplemented = 'notImplemented',
	badRequest = 'badRequest',
	backend = 'backend',
	network = 'network',
	notFound = 'notFound',
	exist = 'exist', // already exists
}

export type E = BeE | FeE | FbsE;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const E = { ...FeE, ...BeE, ...FbsE };

//////////////////////////////////////////////////////////////////////////////
//
// Why custom ErrBase is used?
// See
//	 - https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md
//		#extending-built-ins-like-error-array-and-map-may-no-longer-work
//	 - https://stackoverflow.com/questions/30402287/extended-errors-do-not-have-message-or-stack-trace
//
//////////////////////////////////////////////////////////////////////////////

// DO NOT extends Error. See file-header-comments above.
// Even if we have workaround, to remove confusion and difference among
//	 target(es5, es6), custom class is ued.
export class Err extends ErrBase<E> {
}

export function ethrow(e: E, m?: string, body?: any): never {
	throw new Err(e, m, body);
}

/**
 * Assert Verification. Frequently used. So, name is simplified as 'a'.
 */
export function a(cond: boolean, e: E, msg?: string, body?: any) {
	if (!cond) {
		throw new Err(e, msg, body);
	}
}
