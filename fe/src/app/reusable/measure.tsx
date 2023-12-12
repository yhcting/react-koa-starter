import React, {
	useState
} from 'react';

const measure = {
	scrollbarWidth: 0,
};

const css = {
	scrollbar: {
		width: '100px',
		height: '100px',
		overflow: 'scroll',
		position: 'absolute',
		top: '-9999px'
	} as React.CSSProperties
};

/**
 * Main JSX component to measure browser-dependent-values.
 */
export function Measure() {
	const nonceId = '___scrollbar_measure___';
	const measurer = () => {
		const el = document.getElementById(nonceId);
		measure.scrollbarWidth = el.offsetWidth - el.clientWidth;
	};
	return (<div id={nonceId}
		ref={measurer}
		style={css.scrollbar}>
	</div>);
}

export default measure;
