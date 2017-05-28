import { noop } from 'lodash';

import type { Action } from './action';
import type { Reducer } from './reducer';

type Handlers = { [type: string]: Function };
type Fetched = 'fetched';
type Fetching = 'fetching';
type UnFetched = 'unfetched';
type FetchingState = Fetched | Fetching | UnFetched;

export function createReducer<S, A: Action>(initialState: S, handlers: Handlers): Reducer<S, A> {
	return (state: S = initialState, action: A): S => {
		if (handlers.hasOwnProperty(action.type)) {
			return handlers[action.type](state, action);
		} else {
			return state;
		}
	};
}

export function keyedReducer<S, A: Action>(metaKey, reducer): Reducer<S, A> {
	return function(state: S, action: Action): S {
		return {
			...state,
			[metaKey]: reducer(state[metaKey], action),
		};
	};
}

/**
 * actions this create always have payload mean the literal api payload
 * meta is anything not literally in the payload
 * 
 * @param {*} param0 
 */
export const createActionThunk = ({
	type: string,
	dataFetch: Function,
	meta,
	onError = noop,
	onSuccess = noop,
}) => dispatch => {
	dispatch({
		type,
		meta,
	});

	dataFetch
		.then(payload => {
			dispatch({ type, payload, meta });
			onSuccess(payload);
		})
		.error(error => {
			dispatch({ type, payload: error, error: true });
			onError(error);
		});
};
