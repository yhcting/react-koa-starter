import {
	createSlice,
	PayloadAction,
	Slice
} from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

import cfg from '../config';
import * as DtoUser from '../../fbs/dto/user';
import { E, ethrow } from '../error';
// This is cyclic import! But, it refers only type. So, it's ok.
import { State as AppState } from './index';
import { mapStateFactory } from './ut';

export type FeaturePageType = 'home' | 'test';
export interface Noti {
	msg: string;
	duragion: number;
	type: 'info' | 'warn' | 'error';
}
function defaultNoti(): Noti {
	return {
		msg: '',
		duragion: 5000,
		type: 'info'
	};
}

export interface State {
	user: DtoUser.MeRsp;
	noti: Noti;
	progress: number;
	cover: number;
	featurePage: FeaturePageType;
}

const initialState: State = {
	user: cfg.useAuthentication
		? {user: '', email: '', admin: false}
		: {user: 'noUser', email: 'noUser@fake', admin: true},
	noti: defaultNoti(),
	progress: 0,
	cover: 0,
	featurePage: 'home',
};

const slice = createSlice({
	// This 'name' should respect object structure defined at 'app/store/index.ts'
	name: 'root',
	initialState,
	reducers: {
		user(state, action: PayloadAction<State['user']>) {
			state.user = action.payload;
		},
		noti(state, action: PayloadAction<Partial<Noti> | string>) {
			state.noti = Object.assign(defaultNoti(),
				'string' === typeof action.payload
					? {msg: action.payload}
					: action.payload
			);
		},
		progressBegin(state) {
			state.progress++;
		},
		progressEnd(state) {
			state.progress--;
			if (state.progress < 0) {
				ethrow(E.assert, 'progress underflow');
			}
		},
		coverBegin(state) {
			state.cover++;
		},
		coverEnd(state) {
			state.cover--;
			if (state.cover < 0) {
				ethrow(E.assert, 'blockUserInteraction underflow');
			}
		},
		featurePage(state, action: PayloadAction<FeaturePageType>) {
			state.featurePage = action.payload;
		}
	}
});

export const mystate = (state: AppState) => state[slice.name] as State;

export interface StateSelected extends Omit<State, 'progress'> {
	progress: boolean;
}

function keySelector<K extends keyof State>(k: K
): (s: AppState) => State[K] {
	return (state: AppState) => mystate(state)[k];
}

export const selector = (Object.keys(initialState) as Array<keyof State>)
	.filter(k => k !== 'progress' && k !== 'cover')
	.reduce((a, k) => {
		// To avoid "Error The result function returned its own inputs without modification"
		// a[k] = createSelector(keySelector(k), v => v) as any;
		a[k] = keySelector(k) as any;
		return a;
	}, {
		progress: createSelector(
			(state: AppState) => mystate(state).progress,
			v => 0 < v
		) as any,
		cover: createSelector(
			(state: AppState) => mystate(state).cover,
			v => 0 < v
		) as any
	} as {[K in keyof StateSelected]: (s: AppState) => StateSelected[K]});

export const mapState: <T extends Partial<StateSelected> = StateSelected>(
	state: AppState,
	includes?: Array<keyof StateSelected>,
	excludes?: Array<keyof StateSelected>
) => T = mapStateFactory<StateSelected, any>(selector);

export const actions = slice.actions;

export default slice.reducer;
