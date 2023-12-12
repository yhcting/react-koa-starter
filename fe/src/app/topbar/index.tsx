import React from 'react';
import { Link } from 'react-router-dom';
import {
	useDispatch,
	useSelector
} from 'react-redux';
import {
	Button,
	IconButton,
	LinearProgress,
	Menu,
	MenuItem
} from '@mui/material';
import * as icons from '@mui/icons-material';

import { State } from '../store';
import {
	selector,
	FeaturePageType,
	StateSelected,
} from '../store/root';
import css from './topbar.module.scss';

import * as api from '../service/api';



interface Props {}

//////////////////////////////////////////////////////////////////////////////
// UI actions
//////////////////////////////////////////////////////////////////////////////
function onSelectPage(page: FeaturePageType) {
	// Nothing to do
}

//////////////////////////////////////////////////////////////////////////////
// Rendering
//////////////////////////////////////////////////////////////////////////////
function PageGroup(props: {}) {
	const P = props;
	const featurePage = useSelector(selector.featurePage);
	return (
	<div className={css.pageGroup}>
		<Button component={Link}
			to='/test'
			className={featurePage === 'test'
				? css.pagebtnSelected : css.pagebtn}
			variant='contained'
			disableElevation
			onClick={() => onSelectPage('test')}
			>
			test
		</Button>
	</div>);
}

function ExtraMenu(
	props: {
		menuAnchor: HTMLElement;
		setMenuAnchor: React.Dispatch<HTMLElement>;
	},
) {
	const P = props;
	const detachMenu = () => P.setMenuAnchor(null);
	const onMenuProfile = () => {
		detachMenu();
	};

	return(<>
	<IconButton
		onClick={ev => P.setMenuAnchor(ev.currentTarget)}
		>
		<icons.Menu htmlColor='white'></icons.Menu>
	</IconButton>
	<Menu
		anchorEl={P.menuAnchor}
		keepMounted
		open={Boolean(P.menuAnchor)}
		onClose={detachMenu}
		>
		<MenuItem onClick={onMenuProfile}>
			<icons.AccountBox />
			<span className={css.menuItemText} >Profile</span>
		</MenuItem>
	</Menu>
	</>);
}

function Main(props: Props) {
	const rdx = {
		progress: useSelector(selector.progress),
		user: useSelector(selector.user)
	};
	const [menuAnchor, setMenuAnchor] = React.useState(null);
	return (
	<div className={css.root}>
		<div className={css.topbar}>
			<Button component={Link}
				to='/home'
				className={css.appname}
				variant='contained'
				disableElevation
				onClick={() => onSelectPage('home')}
				>
				HOME
			</Button>
			<PageGroup />
			 <div className={css.rightSide}>
				<icons.AccountCircle htmlColor='white' />
				<span className={css.account}>{rdx.user.user}</span>
				<ExtraMenu {...{menuAnchor, setMenuAnchor}} />
			</div>
		</div>
		{rdx.progress && <LinearProgress className={css.progressbar} />}
	</div>
	);
}
export default Main;
