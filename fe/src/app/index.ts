import ReactDOM from 'react-dom/client';

import { init as serviceInit } from './service';

export async function init(root: ReactDOM.Root) {
	await serviceInit();
}
