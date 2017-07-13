import { noop } from 'lodash';

export function createReducer(initialState, handlers) {
	return (state, action) => {
		if (handlers.hasOwnProperty(action.type)) {
			return handlers[action.type](state, action);
		} else {
			return state;
		}
	};
}

export function keyedReducer(metaKey, reducer) {
	return function(state, action) {
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
	type,
	dataFetch,
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
