import React, {
	useEffect,
	useRef,
	useMemo,
	useState,
	useCallback
} from 'react';
import {
	useLocation,
	useNavigate
} from 'react-router-dom';
import {
	useDispatch,
	useSelector
 } from 'react-redux';
import {
	Card,
	CardContent,
	CardActions,
	Button,
	CircularProgress
} from '@mui/material';
import {
	distinctUntilChanged
} from 'rxjs/operators';
import {
	Subscription,
	BehaviorSubject
} from 'rxjs';

import * as api from '../service/api';
import { State } from '../store';
import {
	StateSelected,
	selector,
	actions
} from '../store/root';
import TextField, {
	TextFieldProps
} from '../reusable/textfield';
import css from './login.module.scss';


interface Props {}

function LoginButton(props: {
	disableLogin$: BehaviorSubject<boolean>;
	onSubmit: () => void;
}) {
	const progress = useSelector(selector.progress);
	const [disabled, setDisabled] = useState(true);
	useEffect(() => {
		// console.log('make subscription');
		const subs = props.disableLogin$.pipe(
			distinctUntilChanged()
		).subscribe(v => {
			// console.log('login: run subscription');
			setDisabled(v);
		});
		return () => {
			// console.log('cleanup login');
			subs.unsubscribe();
		};
	}, [props.disableLogin$]);

	return (<Button
		variant='contained'
		color='primary'
		disabled={progress || disabled}
		onClick={props.onSubmit}
		>
		Login
	</Button>);
}


function Main(P: Props) {
	// console.log('>>> render Login');
	const dispatch = useDispatch();
	const navigate = useNavigate();
	const location = useLocation();
	const query = new URLSearchParams(location.search);
	const pathFrom = query.get('from');

	useEffect(() => {
		dispatch(actions.featurePage('home'));
	}, [dispatch]);

	const urf = useRef({
		userErr: true, // empty is not allowed
		pwErr: false, // true,
		user: '',
		pw: '',
		// This is defintely over-engineering code for sample practice.
		//
		// [ NOTE ]
		// React calls component's render-function of all children when
		//	 render-function of parent is called, by default.
		// But, calling render-function and updating DOM is different story.
		// (See ttps://stackoverflow.com/questions/24718709/reactjs-does-render-get-called-any-time-setstate-is-called)
		// So, render-function is not slow (this is generally true),
		//	 it doesn't impact performance seriously because running render-
		//	 function is very cheap comparing updating DOM.
		// Therefore, this sort of trick SHOULD NOT be used in most cases.
		// This is just for sample implementation for wierd edge cases.
		disableLogin$: new BehaviorSubject(true)
	});
	const refs = urf.current;

	// cleanup useRef
	useEffect(() => () => {
		urf.current.disableLogin$.complete();
	}, []);
	const rdx = {
		progress: useSelector(selector.progress)
	};

	const onChangeUser = ev => {
		urf.current.user = ev.target.value;
	};

	const userValidator = (v: string) => {
		let e = '';
		if (!/^[\w.-]+$/.test(v)) {
			e = 'Invalid user name.';
		}
		const refs = urf.current;
		refs.userErr = !!e;
		refs.disableLogin$.next(refs.pwErr || refs.userErr);
		return e;
	};

	const onChangePw = ev => {
		urf.current.pw = ev.target.value;
	};

	const pwValidator = (v: string) => {
		let e = '';
		if (v.length < 4) {
			e = 'Too short. At least 4 characters!.';
		}
		const refs = urf.current;
		refs.pwErr = !!e;
		refs.disableLogin$.next(refs.pwErr || refs.userErr);
		return e;
	};

	const onSubmit = async () => {
		await api.userFakeLogin({user: refs.user});
		navigate('/home', {replace: true});
	};

	return (<>
	<span style={{fontSize: '2em'}}>This is FAKE only for DEV. This page is NOT available at production!</span>
	<p style={{fontSize: '1.2em'}}>Too see DEMO, login with 'demo' user</p>
	<div className={css.root}>
		<Card>
			<CardContent>
				<div className={css.content}>
					<TextField
						variant='filled'
						label='User'
						helperText='Enter your user name'
						required
						fullWidth
						size='small'
						disabled={rdx.progress}
						defaultValue={''}
						onChange={onChangeUser}
						validator={userValidator}
						/>
					{false && /* Not used at fake login */
					<TextField
						variant='filled'
						style={{marginTop: '10px'}}
						label='Password'
						helperText='Enter you password. At least 4 characters.'
						required
						fullWidth
						size='small'
						disabled={rdx.progress}
						defaultValue={''}
						onChange={onChangePw}
						validator={pwValidator}
						/>
					}
				</div>
			</CardContent>
			<CardActions>
				<LoginButton
					disableLogin$={refs.disableLogin$}
					onSubmit={onSubmit}
					/>
				{rdx.progress && <CircularProgress />}
			</CardActions>
		</Card>
	</div>
	</>);
}
export default Main;
