//
// Common
//
import joi from 'joi';
import hsc from 'http-status-codes';
import { E as FbsE } from '../error';
import * as tychk from '../tychk';

// String is used for readability
export enum DtoE {
	assert = 'assert',
	unknown = 'unknown',
	notImplemented = 'notImplemented',
	exist = 'exist',  // already exist.
	notFound = 'notFound',
	database = 'database',
	badRequest = 'badRequest',
	permission = 'permission',
	authentication = 'authentication',
	/** This may be included at badRequest.(TBD) */
	forbidden = 'forbidden',
}

export type E = DtoE | FbsE;
// eslint-disable-next-line @typescript-eslint/no-redeclare
export const E = { ...DtoE, ...FbsE };


//////////////////////////////////////////////////////////////////////////////
//
//
//
//////////////////////////////////////////////////////////////////////////////
export interface RspErr {
	statusCode: number;
	error: string; /** comes from 'statusCode (above) */
	code?: E;
	message?: string;
	body?: any; /** Any addition information object for error */
}
export function isRspErrInstance(e: any) {
	return tychk.validate(e, joi.object({
		statusCode: joi.number().integer().required(),
		error: joi.string().required(),
		code: joi.string().optional(),
		message: joi.string().allow('').optional(),
		body: joi.any().optional()
	}));
}
export function newRspErr (
	sc: number, code?: E, message?: string, body?: any
) {
	return {
		statusCode: sc,
		error: hsc.getStatusText(sc),
		code,
		message,
		body
	};
}

/**
 * Inspired from http://jsonapi.org/format/
 * Common response for 'list' method.
 */
export interface RspList {
	links?: {
		first?: string;
		last?: string;
		prev?: string;
		next?: string;
	};
}

//////////////////////////////////////////////////////////////////////////////
//
// General Joi verifications.
// Usually used to verify request format.
//
//////////////////////////////////////////////////////////////////////////////
export const Uid_Schema = joi.string().regex(/^[\w\-.]+$/);
