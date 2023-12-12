import server from './server';

async function main() {
	await server();
}

main().then(undefined, e => {
	console.error(e);
	throw e;
});
