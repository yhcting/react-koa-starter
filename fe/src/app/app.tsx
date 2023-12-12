import React, {
	useEffect,
	useState
} from 'react';
import {
	HashRouter as Router,
	Routes,
	Route,
	Link,
	useNavigate,
} from 'react-router-dom';
import {
	useSelector,
	useDispatch
} from 'react-redux';
import * as mui from '@mui/material';


import axios from 'axios';

import * as rest from '../fbs/rest';
import cfg from './config';
import * as api from './service/api';
import { State	} from './store';
import {
	StateSelected as RootStateProps,
	selector,
	actions,
} from './store/root';
import { Measure } from './reusable/measure';
import cssConst from '../styles/_const.module.scss';
import css from './app.module.scss';
import NotFound from './reusable/notfound';
import Test from './test';
import Login from './login';
import Topbar from './topbar';
import Home from './home';

function Snackbar() {
	const dispatch = useDispatch();
	const rdx = {
		noti: useSelector(selector.noti)
	};
	return <mui.Snackbar
		open={!!rdx.noti.msg}
		autoHideDuration={rdx.noti.duragion}
		onClose={() => dispatch(actions.noti(''))}
		message={rdx.noti.msg}
		/>;

}

function AppMain() {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const rdx = {
		user: useSelector(selector.user),
		cover: useSelector(selector.cover),
		noti: useSelector(selector.noti)
	};

	useEffect(() => {(async () => {
		const currentUrl = window.location.href || document.URL;
		// console.log(url);
		if (!rdx.user.user) {
			try {
				const rsp = await api.userMe();
				/**
				 * Note why devLoginHost is required here.
				 * Usually, we develop under help of wepback-dev-server.
				 * And to avoid CORS issue, proxy configuration is used
				 *	 at dev-server.
				 * In this case changing location by url to login-api-endpoint
				 *	 doesn't work (not forwarded to API host by proxy setting)
				 * So, to workaround it, login-api-endpoint of API-host should
				 *	 be described explicitly.
				 * Note that in production release, App-host is same with
				 *	 API-host, so it doesn't matter.
				 */
				if (!rsp.user) {
					/* Move to test login page if it exists
					if (cfg.test) {
						navigate('/login');
						return;
					}
					*/
					// only https is allowed for authentication
					const loginOrigin = cfg.prod || !cfg.devLoginHost
						? api.origin()
						: cfg.devLoginHost;
					const loginPath = new rest.users.LoginGet().url;
					window.location.replace(
						loginOrigin + `/api/${loginPath}?redirectUrl=${encodeURIComponent(currentUrl)}`);
				}
			} catch(e) {
				dispatch(actions.noti('Fail to login'));
			};
		}
	})();}, [navigate, rdx.user.user, dispatch]);

	return !rdx.user.user ? (<div><Snackbar /></div>) : (
	<div>
		{rdx.cover && <div className={css.fullCover}></div>}
		<Topbar></Topbar>
		<div><Routes>
			<Route path='/home/*' element={<Home />} />
			<Route path='/notfound' element={<NotFound />} />
			<Route path='/test' element={<Test />} />
			<Route path='/' element={<Home />} />
		</Routes></div>
		<Snackbar />
	</div>
	);
}

function App() {
	const [appReady, setAppReady] = useState(false);

	if (window.location.pathname.startsWith('/api/')) {
		// Skip routing!
		return <div></div>;
	}

	// Environment: react: 16.14.0, react-router-dom: 5.2.0
	// Empirically, it doesn't trigger rendering(updating) moving to path that
	//	 doesn't contains 'Route'(sub-routing) in it.
	// So, if 'Login' is in 'Switch' at 'AppMain', url may not re-directed to
	//	 'Login' when page is moved to somewhere which is leaf having no
	//	 sub-routing.
	// To avoid it, 'login' Route is located here.
	// 'AppMain' clearly has sub 'Route' in it.
	// Therefore, this would be re-rendered and effect would be checked
	//	 at all time.
	return appReady ? (<>
	<Router>
		<Routes>
			<Route path='/login/*' element={<Login />} />
			<Route path='/*' element={<AppMain />} />
		</Routes>
	</Router>
	</>) : (<div ref={() => setAppReady(true)}>
	<Measure />
	</div>);
}

export default App;
