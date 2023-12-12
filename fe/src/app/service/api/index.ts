// export * from './api.mock';
export * from './api';

// commmon functions between mock and real service.
export function errdata(e: any) {
	return e?.response?.data;
}
