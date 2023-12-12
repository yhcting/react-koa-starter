import React from 'react';

interface DivLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
}

function Div(props: DivLayoutProps, direction: 'row' | 'column') {
	const style = Object.assign({
		display: 'flex',
		flexDirection: direction
	}, props.style ?? {});
	const newProps = {...props, style};
	return (<div {...newProps}></div>);
}

export function DivR(props: DivLayoutProps) {
	return Div(props, 'row');
}

export function DivC(props: DivLayoutProps) {
	return Div(props, 'column');
}
