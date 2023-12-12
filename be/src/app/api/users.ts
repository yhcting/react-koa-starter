import Koa from 'koa';
import Router, { RouterContext } from '@koa/router';
import cfg from '../../config';
import { users as rest } from '../../fbs/rest';
import * as dto from '../../fbs/dto/user';
import { E, ethrow } from '../error';
import { newLogger } from '../logger';
import {
	Session,
	RouteHandlerFunc,
	registerRouteHandlers
} from './cmmn';

interface ModuleContext {
}

type Handler<Req = unknown, Rsp = unknown> = RouteHandlerFunc<Req, ModuleContext, Rsp>;

const lg = newLogger(module);

//
// Middlewares
//
const apiLoginGet: Handler = (
	req, sess, request, ctx, mctx, next
) => {
	return {};
};

const apiMe: Handler<dto.MeReq, dto.MeRsp> = async (
	req, sess
) => {
	return {
		user: sess?.user ?? '',
		email: sess?.email ?? '',
		admin: true
	};
};


const apiLoginPost: Handler<any, undefined> = (
	req, sess, request, ctx, mctx
) => {
	return undefined;
};

const apiLogout: Handler<unknown, {}> = (
	req, sess, request, ctx, mctx
) => {
	ctx.session.body = undefined;
	return {};
};

const apiFakeLogin: Handler<dto.FakeLoginReq, dto.FakeLoginRsp> = (
	req, sess, request, ctx, mctx
) => {
	const newSession: Session = {
		user: req.user,
		email: req.user + '@test.tst'
	};
	ctx.session.body = newSession;
	return {};
};

export function setup(koa: Koa, parentRouter: Router): Router.Middleware {
	const mctx: ModuleContext = {
	};

	// This is registered before 'route' middleware
	// koa.use(...);

	const router = new Router();
	registerRouteHandlers(
		router,
		mctx,
		[
			[rest.LoginGet.method, rest.LoginGet.urlfmt, apiLoginGet,
				undefined, true],
			// [Rest.LoginPost.method, Rest.LoginPost.urlfmt, apiLoginPost]
			[rest.Me.method, rest.Me.urlfmt, apiMe,
				undefined, true],
			// Only logined user can logout
			[rest.Logout.method, rest.Logout.urlfmt, apiLogout],
			...(!cfg.test ? [] as any : [
				// Only for dev build
				[rest.FakeLogin.method, rest.FakeLogin.urlfmt, apiFakeLogin,
					rest.FakeLogin.validator, true]
			])
		]
	);

	return router.routes();
}
