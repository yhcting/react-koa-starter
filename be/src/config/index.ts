import path from 'path';
import fs from 'fs';
import { ok as assert } from 'assert';

import * as wt from 'worker_threads';

type ModeType = 'unittest' | 'resttest' | 'development' | 'production';
const ModeType = new Set(['unittest', 'resttest', 'development', 'production']);

export enum DbgLv {
	No = 0,
	Basic = 1,
	Strict = 2
}

export interface Config {
	prod: boolean;
	test: boolean;
	prjdir: string; /** project directory - absolute path */
	mode: {
		type: ModeType;
		dbglv: DbgLv;
	};
	server: {
		host: string;
		https?: {
			port: number;
			key: string;
			cert: string;
		};
		http: {
			port: number;
		};
	};
	sessKeepAliveTtl: number;
	numWorker: number;
	/** True to run in single thread. Usually for debugging */
	singleThread: boolean;
}

const prjdir = process.cwd();
const localcert = fs.readFileSync(
	path.resolve(prjdir, 'ssl/localhost.crt'), 'utf8').toString();
const localkey = fs.readFileSync(
	path.resolve(prjdir, 'ssl/localhost.key'), 'utf8').toString();
const dev: Config = {
	prod: false,
	test: true,
	prjdir: undefined,
	mode: undefined,
	server: {
		host: '0.0.0.0',
		https: {
			key: localkey,
			cert: localcert,
			port: 8011
		},
		http: {port: 8010},
	},
	sessKeepAliveTtl: 1000 * 60 * 60 * 24 * 7,
	numWorker: 1,
	singleThread: false,
};

const NODE_ENV = process.env['NODE_ENV'] as string
	|| 'development,strict';

export const cfg: Config =
	(NODE_ENV === 'production' || NODE_ENV.startsWith('production,'))
		 ? require('./prod') // overwriting prod config.
		 : dev;

cfg.prjdir = prjdir;

function getMode(): Config['mode'] {
	const ns = NODE_ENV.split(',');
	const type = ns[0] as ModeType;
	assert(ModeType.has(type));
	let dlstr = ns[1];
	if (undefined === dlstr) {
		switch (type) {
		case 'unittest':
		case 'resttest':
			dlstr = 'strict';
			break;
		case 'development':
			dlstr = 'basic';
			break;
		case 'production':
			dlstr = 'no';
			break;
		}
	}
	let dbglv = DbgLv.Strict;
	switch (dlstr) {
		case 'no': dbglv = DbgLv.No; break;
		case 'basic': dbglv = DbgLv.Basic; break;
		case 'strict': dbglv = DbgLv.Strict; break;
		default: assert(false);
	}
	return {
		type,
		dbglv
	};
}

if (!cfg.mode) {
	cfg.mode = getMode();
}

if ('production' !== cfg.mode.type
	&& wt.isMainThread
) {
}

// To avoid MaxListenersExceededWarning: Possible EventEmitter memory leak detected.
// This seems bug of NodeJs.(Tested at NodeJs 10.16.0)
// See: https://github.com/nodejs/node/pull/27691
// This is just workaround.
// TODO: Check this issue later with latest NodeJs version
/*
Events.EventEmitter.defaultMaxListeners
	= Events.EventEmitter.defaultMaxListeners + cfg.numWorker;
*/

export default cfg;
