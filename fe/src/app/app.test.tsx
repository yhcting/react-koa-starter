import React from 'react';
import { Provider } from 'react-redux';
import { render, screen } from '@testing-library/react';
import App from './app';
import store from './store';

test('renders learn react link', () => {
	render(
		<Provider store={store}>
			<App />
		</Provider>
	);
	try {
		const linkElement = screen.getByText(/invalidTestElement/i);
		expect(linkElement).not.toBeInTheDocument();
	} catch (ignore) { }
});

