import { createAction } from 'redux-actions';
import sdk from '../sdk';

/* action types */
export const LOGIN_USER_REQUEST = 'USER_LOGIN_REQUEST';
export const LOGIN_USER_SUCCESS = 'USER_LOGIN_SUCCESS';
export const LOGIN_USER_FAILURE = 'USER_LOGIN_FAILURE';
export const LOGOUT_USER = 'LOGOUT_USER';
export const PLAY_SONG = 'PLAY_SONG';
export const PAUSE_SONG = 'PAUSE_SONG';
export const VOTE_SONG = 'VOTE_SONG';
export const SET_SORT = 'SET_SORT';
export const DELETE_SONG = 'DELETE_SONG';
export const SHUFFLE_SONGS = 'SHUFFLE_SONGS';
export const RECEIVE_PLAYLIST = 'RECEIVE_PLAYLIST';
export const SET_PLAYLIST = 'SET_PLAYLIST';
export const FETCH_EVENTS = 'FETCH_EVENTS';
export const ADD_ENTITIES = 'ADD_ENTITIES';

/* action creators */
export type SongIdPayload = { songId?: number };
export type PlaylistIdPayload = { playlistId?: number };
// type NoPayload = undefined;
export type UserPayload = { user };
export type SetPlaylistPayload = { playlistId };

export const requestLogin = createAction<UserPayload>(LOGIN_USER_REQUEST);
export const logout = createAction(LOGOUT_USER);

export type LoginUserSuccessPayload = { username; upvotedSongs; id };
export const loginUserSuccess = createAction<LoginUserSuccessPayload>(LOGIN_USER_SUCCESS);

export const playSong = createAction<SongIdPayload & { stream? }>(PLAY_SONG);
export const pauseSong = createAction(PAUSE_SONG);

export type SORT = 'votes' | 'title' | 'artist' | 'playlist' | 'user' | 'duration' | 'date';
export type SetSortPayload = { sort: SORT };
export const setSort = createAction<SetSortPayload>(SET_SORT);
export const shuffleSongs = createAction(SHUFFLE_SONGS);
export const loginUserFailure = createAction<UserPayload>(LOGIN_USER_FAILURE);
export type EventsPayload = { events };
export const fetchEvents = createAction(FETCH_EVENTS, sdk.getEvents);

/* Thunk Async Actions */

export const requestPlaylist = ({ playlistName, userId }) => async dispatch => {
	try {
		const playlist = await sdk.getPlaylistForName(playlistName);
		dispatch(addEntities(playlist));
	} catch (err) {
		// TODO this is a hack for now to add the playlist if it doens't exist
		if (userId) {
			await sdk.createPlaylist({ playlistName, userId });
			const playlist = await sdk.getPlaylistForName(playlistName);
			dispatch(addEntities(playlist));
		}
		console.error(err);
	}
};

export const loginUser = (login: any) => async (dispatch: any) => {
	dispatch(requestLogin({ user: login.username }));
	try {
		const { users, user }: any = await sdk.getUser(login.username, 'so secure');
		dispatch(addEntities({ users }));
		localStorage.setItem('login', JSON.stringify(login));
		dispatch(loginUserSuccess({ username: user.username, upvotedSongs: [], id: user.id }));
	} catch (error) {
		console.error(error, error.stack);
		dispatch(loginUserFailure(login.username));
	}
};

export const voteSong = createAction(VOTE_SONG, sdk.vote);
export const unvoteSong = createAction(VOTE_SONG, sdk.unvote);
export const deleteSong = createAction(DELETE_SONG, sdk.deleteSong);
export const fetchSongsInPlaylist = createAction(ADD_ENTITIES, sdk.getSongsInPlaylist);
export const addEntities = createAction<any>(ADD_ENTITIES);
export const setPlaylistName = createAction(SET_PLAYLIST, sdk.getPlaylistForName);
