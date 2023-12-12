
import Koa from 'koa';
import Router, { RouterContext } from '@koa/router';
import hsc from 'http-status-codes';

import { Validator } from '../../fbs/rest';
import { newRspErr } from '../../fbs/dto/cmmn';
import { newLogger } from '../logger';
import {
	E,
	Err,
	isErrInstance
 } from '../error';

const lg = newLogger(module);

export interface Session {
	user: string;
	email: string;
}

export function setErrRsp(
	ctx: RouterContext, /** [In/Out] */
	sc: number, code?: E, message?: string, body?: any
) {
	ctx.status = sc;
	ctx.body = newRspErr(sc, code, message, body);
}


export type RouteHandlerFunc<
	Req extends {[k: string]: any},
	MCtx extends {[k: string]: any},
	Rsp = any
> = (
	req: Req,
	sess?: Session,
	request?: RouterContext['request'],
	// NOTE
	// Below two argument should be used in very special cases only.
	// Using ctx, next directly is not good for future API testing.
	ctx?: RouterContext,
	mctx?: MCtx,
	next?: Koa.Next
) => Rsp | Promise<Rsp>;


function errToStatus(code: E) {
	switch (code) {
	case E.notImplemented: return hsc.NOT_IMPLEMENTED;
	case E.authentication:
	case E.unauthorized: return hsc.UNAUTHORIZED;
	case E.unknown:
	case E.database:
	case E.assert: return hsc.INTERNAL_SERVER_ERROR;
	default: return hsc.BAD_REQUEST;
	}
}

/** Route Handler Factory */
export function rhf<D, T>(
	func: RouteHandlerFunc<D, T>,
	mctx: T,
	validator?: Validator,
	allowAnonymous?: boolean
): Router.Middleware {
	return async (ctx, next) => {
		lg.d(ctx.ip, ctx.method, ctx.path);
		validator = validator || {};
		for (const [_k, jo] of Object.entries(validator)) {
			const k: keyof typeof validator = _k as any;
			const v = jo.validate(
				'params' === k ? ctx.params
					: 'body' === k
						? ctx.request?.body
						: ctx.request?.query
				, {convert: false});
			if (v.error) {
				setErrRsp(ctx, hsc.BAD_REQUEST,
					E.badRequest, `${v.error}`);
				return;
			}
		}

		if (!allowAnonymous && !ctx.session.body) {
			// no session
			setErrRsp(ctx, hsc.UNAUTHORIZED, E.unauthorized);
			return;
		}

		try {
			const r = await func(
				{
					// FIXME: typeof ctx.request.body is unknown.
					// What kinds of type it could be?
					...((ctx.request?.body as any) ?? {}),
					...(ctx.request?.query ?? {}),
					...ctx.params
				},
				ctx.session.body,
				ctx.request,
				ctx,
				mctx,
				next);
			if (undefined === r) {
				return r;
			} else {
				ctx.status = hsc.OK;
				ctx.body = r;
			}
		} catch (e) {
			if (isErrInstance<Err>(e)) {
				setErrRsp(ctx, errToStatus(e.code),
					e.code, e.toString());
			} else {
				lg.w('Unexpected error at API', e);
				setErrRsp(ctx, hsc.INTERNAL_SERVER_ERROR,
					E.unknown, `${e}`);
			}
		}
	};
}

type RouteHandler<Req, MCtx, Rsp = any> = [
	'get' | 'post' | 'put' | 'delete', // method
	string, // path
	RouteHandlerFunc<Req, MCtx, Rsp>,
	Validator?,
	boolean? // Allow Anonymous?
];

export function registerRouteHandlers<MCtx>(
	router: Router,
	mctx: MCtx,
	handlers: RouteHandler<any, MCtx, any>[]
) {
	handlers.forEach(h => router[h[0]](
		'/' + h[1], rhf(h[2], mctx, h[3], h[4])));
}
