import { Config } from './index';

const cfg: Config = {
	prod: true,
	test: false,
	prjdir: undefined,
	mode: undefined,
	server: {
		host: '',
		https: {
			port: 0,
			key: '',
			cert: ''
		},
		http: {
			port: 0
		}
	},
	sessKeepAliveTtl: 1000 * 60 * 60 * 24,
	numWorker: 1,
	singleThread: false,
};

export = cfg;
