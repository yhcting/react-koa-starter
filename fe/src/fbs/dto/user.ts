import joi from 'joi';

//////////////////////////////////////////////////////////////////////////////
// For AD SSO
//////////////////////////////////////////////////////////////////////////////
export interface MeReq {
	// token: string; - Auth token would be sent as cookie.
}

export type MeRsp = {
	user: string; /** user id. empty if user is invalid */
	email: string;
	admin: boolean;
};

export interface FakeLoginReq {
	user: string;
}
export const FakeLoginReq_SchemaKeys = {
	user: joi.string().required()
};

export interface FakeLoginRsp {}

export type Rsp =
	MeRsp
	| FakeLoginRsp
	;
