import React, {
	useEffect,
	useState,
	useRef
} from 'react';
import * as mui from '@mui/material';
import { pxToNum } from './ut';
import Tooltip from './tooltip';
import css from './val.module.scss';

type ValType = string | string[] | boolean;
interface Props {
	v: ValType; // at this moment only string is supported
	style?: React.CSSProperties;
	editable?: boolean; // Not supported yet
	onUpdate?: (v: any) => void; // Not supported yet
}
export type ValProps = Props;

function render(P: Props): string;
function render(P: Props, toString: false): string;
function render(P: Props, toString: true): JSX.Element;
function render(P: Props, toString?: boolean): string | JSX.Element {
	const v = P.v;
	const _render = () => {
		if ('boolean' === typeof v) {
			if (toString) {
				return v ? 'true' : 'false';
			} else {
				return (<mui.Checkbox
					checked={v}
					disabled={!P.editable}
					color='primary'
				/>);
			}
		} else if (Array.isArray(v)) {
			return v.join(', ');
		} else {
			return v;
		}
	};
	const e = _render();
	return toString ? e : (<>{e}</>);
}

// virtual list
export function Val (P: Props) {
	// Note that we can calulate exact value of it dynamically here.
	// But, it's not efficient at all!
	// const myref = React.createRef<HTMLDivElement>();
	const myref = useRef<HTMLDivElement>();
	const [tooltip, setTooltip] = useState('');

	useEffect(() => {
		setTooltip(myref.current.clientWidth < myref.current.scrollWidth
				? render(P) : '');
	}, [P]);

	return (<Tooltip title={tooltip}>
		<div ref={myref} className={css.text} style={P.style}>
			{render(P, false)}
		</div>
	</Tooltip>);
}
export default Val;
