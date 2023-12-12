import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider as ReduxProvider } from 'react-redux';

import './polyfills';
import './index.scss';
import { init as appInit } from './app';
import App from './app/app';
import store from './app/store';

async function init(root: ReactDOM.Root) {
	appInit(root);
}

async function main() {
	const root = ReactDOM.createRoot(
		document.getElementById('root') as HTMLElement
	);

	await init(root);

	root.render(
		<React.StrictMode>
			<ReduxProvider store={store}>
				<App />
			</ReduxProvider>
		</React.StrictMode>
	);
}

main().then(() => {}, console.error);
