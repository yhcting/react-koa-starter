import path from 'path';

import Koa from 'koa';
import Router from '@koa/router';
import logger from 'koa-logger';
import session from 'koa-session';
import bodyParser from 'koa-bodyparser';
import https from 'https';
import http from 'http';
import { koaSwagger } from 'koa2-swagger-ui';
import serve from 'koa-static';

// Interesting middlewares
// - koa-ratelimit
// - koa-compress

import cfg from '../config';
import * as cookie from '../fbs/cookie';
import * as app from '../app';

export default async function start() {
	const koa = new Koa();
	const router = new Router({
		prefix: '/api'
	});

	cfg.prod && koa.use(logger());
	koa.use(serve(path.join(cfg.prjdir, 'fe')));

	//
	// Session would better to be before bodyparser and after static serve.
	//
	// Use https key as session signing key
	koa.keys = [cfg.server.https.key];
	koa.use(session({
		key: cookie.keys.sso,
		/**
		 * (number || 'session') maxAge in ms (default is 1 days)
		 * 'session' will result in a cookie that expires when session/browser is closed
		 * Warning: If a session cookie is stolen, this cookie will never expire
		 */
		maxAge: 86400000, /** cookie Overdue time */
		autoCommit: true, /** (boolean) automatically commit headers (default true) */
		overwrite: true, /** (boolean) can overwrite or not (default true) */
		httpOnly: true, /** (boolean) httpOnly or not (default true) */
		signed: true, /** (boolean) signed or not (default true) */
		/**
		 * (boolean) Force a session identifier cookie to be set on every response.
		 * The expiration is reset to the original maxAge, resetting the expiration countdown.
		 * (default is false)
		 */
		rolling: false,
		/**
		 * (boolean) renew session when session is nearly expired,
		 * so we can always keep user logged in. (default is false)
		 */
		renew: false,
		secure: cfg.prod, /** (boolean) secure cookie*/
		/** (string) session cookie sameSite options (default null, don't set it) */
		sameSite: cfg.prod ? null : undefined,
	// as any to make typesript happy. @type of koa-session is out-of-date.
	} as any, koa));

	koa.use(bodyParser());

	// const spec = yamljs.load(Path.join(cfg.prjdir, 'openapi.yaml'));
	// router.use(koaSwagger({ swaggerOptions: { spec } }));

	await app.init(koa, router);

	// It is good for Router-middleware to be in last of middleware chain.
	koa.use(router.routes())
		.use(router.allowedMethods());

	// app.listen(cfg.port);
	http.createServer(koa.callback())
		.listen(cfg.server.http.port, cfg.server.host, listeningReporter);

	if (cfg.server.https) {
		https.createServer({
			key: cfg.server.https.key,
			cert: cfg.server.https.cert
		}, koa.callback())
			.listen(cfg.server.https.port, cfg.server.host, listeningReporter);
	}
}

function listeningReporter (this: any) {
	// `this` refers to the http server here
	const { address, port } = this.address();
	const protocol = this.addContext ? 'https' : 'http';
	console.log(`Listening on ${protocol}://${address}:${port}...`);
}
