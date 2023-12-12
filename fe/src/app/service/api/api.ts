import axios from 'axios';

import * as dtoUser from '../../../fbs/dto/user';
import * as rest from '../../../fbs/rest';

import { E, ethrow } from '../../error';
import store from '../../store';
import { actions as actRoot } from '../../store/root';

const ctx = {
	urlOrigin: '', // url origin
	urlApi: ''
};

// Send all cookies by default
// Axios.defaults.withCredentials = true;

/* This is sample code to disable caching
axiosInstance.defaults.headers = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Expires': '0',
};
*/

export function origin() {
	return ctx.urlOrigin;
}

/** api endpoint */
function ep(path: string) {
	return ctx.urlApi + '/' + path;
}

async function netOp<T>(p: Promise<T>): Promise<T> {
	store.dispatch(actRoot.progressBegin());
	try {
		const r = await p;
		return r;
	} finally {
		store.dispatch(actRoot.progressEnd());
	}
}

async function apiOp<T = any>(r: rest.Rest<unknown>) {
	return r.body && ('post' === r.method || 'put' === r.method)
		? netOp<T>(axios[r.method](ep(r.url), r.body))
		: netOp<T>((axios as any)[r.method](ep(r.url)));
}

export function init() {
	const currentUrl = window.location.href || document.URL;
	const url = new URL(currentUrl);
	ctx.urlOrigin = url.origin;
	ctx.urlApi = ctx.urlOrigin + '/api';
}

//
// User
//
export async function userMe(): Promise<dtoUser.MeRsp> {
	const r = new rest.users.Me();
	const rsp: dtoUser.MeRsp = (await apiOp(r)).data;
	store.dispatch(actRoot.user(rsp));
	return rsp;
}

export async function userFakeLogin(req: dtoUser.FakeLoginReq): Promise<dtoUser.FakeLoginRsp> {
	return {};
}

