import * as fbsut from './fbs/ut';

describe('Fbs sample test', () => {
	it('sample', () => {
		const r = fbsut.escapeRegExp('//');
		console.log(r);
	});
});
