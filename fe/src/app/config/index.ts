export interface Config {
	prod: boolean;
	// only for dev. to workaround dev-server's proxy
	devLoginHost?: string;
	// use user authentication
	useAuthentication?: boolean;
}

const dev: Config = {
	prod: false,
	// devLoginHost?: 'http://10.253.105.127:8011';
	useAuthentication: false
};

const NODE_ENV = process.env['NODE_ENV'] as string;
export const cfg: Config = 'production' === NODE_ENV
		 ? require('./prod').default
		 : dev;

export default cfg;

