
//////////////////////////////////////////////////////////////////////////////
//
// REST API Utilities: DTO to REST API.
//
//////////////////////////////////////////////////////////////////////////////
import * as dtoUser from './dto/user';
import { escapeRegExp } from './ut';
import joi from 'joi';

export interface Validator {
	query?: joi.Schema;
	body?: joi.Schema;
	params?: joi.Schema;
}


export class Rest<T extends {[k: string]: any} = undefined> {
	public readonly body: Partial<T>;
	/**
	 * URL path without prefix including 'protocol://host:port/api/'.
	 * It should not starts with '/'.
	 */
	public readonly url: string;
	constructor(
		public readonly urlfmt: string,
		public readonly req: T,
		public readonly method: 'put' | 'post' | 'delete' | 'get' | 'patch'
	) {
		const params = new Set<string>();
		let s = urlfmt;
		if (req) {
			for (const [k, v] of Object.entries(req)) {
				// this is url format of Koa-router(backend)
				const re = new RegExp(`:${escapeRegExp(k)}(?!\\w)`, 'g');
				const old = s;
				s = s.replace(re, encodeURIComponent(v.toString()));
				// this field is used as params.
				// So, it should be removed from body
				if (old !== s) { params.add(k); }
			}
			const body = {...req};
			[...params].map(k => delete body[k]);
			if (('get' === method || 'delete' === method)
				&& Object.keys(body).length > 0
			) {
				// Note that nested object is not supported as you expected
				//	at URLSearchParams
				s += '?' + (new URLSearchParams(body)).toString();
			} else {
				this.body = body;
			}
		}
		this.url = s;
	}
}


export namespace users {
	export const base = 'users';
	const ep = (path: string) => base + (path ? '/' : '') + path;

	// Very special REST path
	export class LoginGet extends Rest {
		static readonly urlfmt = 'login';
		static readonly method = 'get';
		constructor() {super(ep(LoginGet.urlfmt), undefined, LoginGet.method);}
	}

	// This is only for test and debug
	export class FakeLogin extends Rest<dtoUser.FakeLoginReq> {
		static readonly urlfmt = 'fakelogin';
		static readonly method = 'post';
		static readonly validator: Validator = {
			body: joi.object(dtoUser.FakeLoginReq_SchemaKeys).strict()
		};
		constructor(req: dtoUser.FakeLoginReq) {
			super(ep(FakeLogin.urlfmt), req, FakeLogin.method);}
	}

	export class Logout extends Rest {
		static readonly urlfmt = 'logout';
		static readonly method = 'post';
		constructor() {super(ep(Logout.urlfmt), undefined, Logout.method);}
	}

	export class Me extends Rest {
		static readonly urlfmt = 'me';
		static readonly method = 'get';
		constructor() {super(ep(Me.urlfmt), undefined, Me.method);}
	}
}
