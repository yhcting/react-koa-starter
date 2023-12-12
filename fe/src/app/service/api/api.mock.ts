import lodash from 'lodash';
import httpStatus, { StatusCodes } from 'http-status-codes';

import { E } from '../../../fbs/error';
import { RspErr } from '../../../fbs/dto/cmmn';
import * as dtoUser from '../../../fbs/dto/user';

import store from '../../store';
import { actions as actionsRoot } from '../../store/root';

function toAsync<R = any>(
	func: () => R,
	delay?: number,
	e?: RspErr
): Promise<R> {
	store.dispatch(actionsRoot.progressBegin());
	return new Promise((rs, rj) => {
		setTimeout(() => {
			const r = e ? '' as any : func();
			store.dispatch(actionsRoot.progressEnd());
			e ? rj(e) : rs(r);
		}, delay ?? 0);
	});
}

function rspErr(sc: number, override?: Partial<RspErr>) {
	return Object.assign({
		statusCode: sc,
		error: httpStatus.getStatusText(sc)
	}, override ?? {});
}

//
// Dummy functions to match interfaces of api.ts
//
export function origin() {
	return '';
}
export function init() {
}


//
// User
//
export function userMe(): Promise<dtoUser.MeRsp> {
	const rsp: dtoUser.MeRsp = {
		user: 'noUser', email: 'noUser@fake', admin: true
	};
	// const err = rspErr(httpStatus.BAD_REQUEST);
	const err = undefined;
	return toAsync(() => {
		store.dispatch(actionsRoot.user(rsp));
		return rsp;
	}, 500, err);
}

export async function userFakeLogin(req: dtoUser.FakeLoginReq): Promise<dtoUser.FakeLoginRsp> {
	return {};
}
