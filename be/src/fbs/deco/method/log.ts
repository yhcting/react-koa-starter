
export function log(tag?: string) {
	return (target: any, key: string | symbol, descriptor: undefined | TypedPropertyDescriptor<any>) => {
		if (undefined === descriptor) {
			descriptor = Object.getOwnPropertyDescriptor(target, key);
		}
		const orig = descriptor!.value;
		tag = tag ? `[${tag}]` : '';
		const tgtname = (target.constructor && target.constructor.name)
			? target.constructor.name + ':'
			: '';
		descriptor!.value = function () {
			console.log(`<log${tag}> ${tgtname} ${key.toString()}`);
			for (const a of Array.from(arguments)) {
				console.log(' '.repeat(80), a);
			}
			return orig.apply(this, arguments);
		};
		return descriptor;
	};
}
