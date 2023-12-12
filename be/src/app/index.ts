import Koa from 'koa';
import Router from '@koa/router';

import { init as apiInit } from './api';

export async function init(koa: Koa, router: Router): Promise<void> {
	await apiInit(koa, router);
}
