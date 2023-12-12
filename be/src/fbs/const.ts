interface TimeUnit {
	s: number;
	m: number;
	h: number;
	d: number;
	w: number;
}

export const tu: {
	ms: TimeUnit;
	s: Omit<TimeUnit, 's'>;
} = {s: {}} as any;
tu.s.m = 60;
tu.s.h = tu.s.m * 60;
tu.s.d = tu.s.h * 24;
tu.s.w = tu.s.d * 7;
tu.ms = ['m', 'h', 'd', 'w'].reduce((a, k) => {
	a[k] = a.s * tu.s[k];
	return a;
}, {s: 1000} as TimeUnit);
