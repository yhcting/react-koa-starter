import React, {
	useRef,
	useState,
	useEffect
} from 'react';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import * as mui from '@mui/material';
import * as icons from '@mui/icons-material';

import { isNullish } from './ut';

export type TextFieldProps = mui.TextFieldProps & {
	richHelp?: JSX.Element;
	onChangeDebounced?: (v: string) => void;
	onChangeDebounceTime?: number;
	/** '' if success, otherwise error message */
	validator?: (v: string) => string | Promise<string>;
};


function HelpButton(props: {
	richHelp: JSX.Element;
}) {
	const [open, setOpen] = useState(false);

	const onClose = () => setOpen(false);
	const onClick = () => setOpen(true);

	return (<div style={{height: '32px', width: '32px'}}>
	<mui.IconButton size='small' onClick={onClick}>
		<icons.Help fontSize='inherit' />
	</mui.IconButton>
	<mui.Dialog open={open} onClose={onClose}>
		{props.richHelp}
	</mui.Dialog>
	</div>);
}

/**
 * What is differnet from TextField of @material-ui is that
 *	 'value' always win over 'defaultValue'.
 */
function TextField(P: TextFieldProps) {
	const newProps = {...P};
	const overrideProps: Array<keyof TextFieldProps> = [
		'value',
		'defaultValue', // TextField should be always controlled.
		'onChange',
		'validator',
		'onChangeDebounced',
		'onChangeDebounceTime',
		'helperText',
		'richHelp'
	];
	overrideProps.forEach(k => delete newProps[k]);

	// This is to support onChangeDebounceTime
	const [val, setVal] = useState(P.value ?? P.defaultValue);
	const [err, setErr] = useState('');

	const change$ = useRef<Subject<{
		v: string;
		onChangeDebounced: TextFieldProps['onChangeDebounced'];
	}>>();

	useEffect(() => {
		change$.current = new Subject();
		change$.current.pipe(
			debounceTime(P.onChangeDebounceTime ?? 0)
		).subscribe(({v, onChangeDebounced}) => {
			onChangeDebounced && onChangeDebounced(v);
		});
		return () => {
			change$.current.complete();
		};
	}, [P.onChangeDebounceTime]);


	useEffect(() => setVal(P.value ?? P.defaultValue)
	, [P.value, P.defaultValue, setVal]);

	const onChange = (ev: React.ChangeEvent<any>) => {
		P.onChange && P.onChange(ev);
		const v = ev.target.value;
		// Not to change uncontrolled TextField.
		!isNullish(val) && setVal(v);
		let rsp = P.validator && P.validator(v);
		// logical nullish assignment is not supported at current typescript
		// (rsp ??= '')
		rsp = rsp ?? ''; // no validator means success
		Promise.resolve(rsp)
		.then(rsp => setErr(rsp))
		.catch(e => setErr(`Validator fails: ${e}`));
		change$.current.next({v, onChangeDebounced: P.onChangeDebounced});
	};

	return (<div style={{
			display: 'flex',
			flexDirection: 'row'
		}}>
		<mui.TextField
			{...newProps}
			value={val}
			onChange={onChange}
			helperText={err || P.helperText}
			error={P.error || !!err}
			>
		</mui.TextField>
		{P.richHelp ? (<HelpButton richHelp={P.richHelp} />) : undefined}
	</div>);
}

export default TextField;
