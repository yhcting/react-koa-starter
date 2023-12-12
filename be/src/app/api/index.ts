import fs from 'fs';

import Koa from 'koa';
import Router from '@koa/router';

import cfg from '../../config';

const fsp = fs.promises;

// Modules that are not api module.
const excludes = [
	'index',
	'cmmn'
];

export interface ApiModule {
	setup: (koa: Koa) => Router.Middleware | Promise<Router.Middleware>;
}

export async function init(koa: Koa, router: Router) {
	const apidir = __dirname;
	const files = await fsp.readdir(apidir);
	const exc = new Set(excludes.map(v => v + '.js'));
	const modfiles = files.filter(f => f.endsWith('.js') && !exc.has(f));

	await Promise.all(modfiles.map(async f => {
		const m: ApiModule = require('./' + f);
		const mname = f.substring(0, f.length - '.js'.length);
		const routes = await m.setup(koa);
		router.use('/' + mname, routes);
	}));
}
