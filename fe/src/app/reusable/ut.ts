export function pxToNum(px: string) {
	return Number(px.substring(0, px.length - 2));
}

export function isNullish(v: any) {
	return null === v || undefined === v;
}

export function unixEpochToDate(n: number) {
	return new Date(n * 1000);
}

export function dateToUnixEpoch(d: Date) {
	return Math.floor(d.getTime() / 1000);
}
