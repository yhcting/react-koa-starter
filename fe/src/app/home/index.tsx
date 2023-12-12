import React, {
	useEffect
} from 'react';
import {
	useDispatch,
} from 'react-redux';
import cfg from '../config';
import { State } from '../store';
import {
	StateSelected as StatePropsRoot,
	actions,
} from '../store/root';
import { keys as cookieKeys } from '../../fbs/cookie';
import cookie from '../service/cookie';

type Token = { userId: string | null; createdAt: Date | null; expiredAt: Date | null };

interface Props {}

function Main(P: Props) {
	// To let App knows current featurePage in case that user enter this page
	// directly via URL or URL link.
	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(actions.featurePage('home'));
	}, [dispatch]);

	/*
	const location = useLocation();
	console.log(location);
	const currentUrl = window.location.href || document.URL;
	console.log(currentUrl);
	*/
	/*
	const login = (): void => {
		const currentUrl = window.location.href || document.URL;
			window.location.replace(`https://YOUR-IP-ADDRESS:8010/auth/login?redirectUrl=${currentUrl}`);
	};
	*/

	return (<div>
		<h2>Welcome!</h2>
	</div>);
};

export default Main;
