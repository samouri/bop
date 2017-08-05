import { createAction } from 'redux-actions';
import sdk from '../sdk';

/* action types */
export const FETCH_SONGS = 'FETCH_SONGS';
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
export const SET_PLAYLIST_NAME = 'SET_PLAYLIST_NAME';

/* action creators */
export type Action = { type: string };
export type SongIdPayload = { songId?: number };
export type PlaylistIdPayload = { playlistId: number };
// type NoPayload = undefined;
export type UserPayload = { user };
export type SetPlaylistNamePayload = { playlistName };
export const setPlaylistName = createAction<SetPlaylistNamePayload>(SET_PLAYLIST_NAME);

export const requestLogin = createAction<UserPayload>(LOGIN_USER_REQUEST);
export const logout = createAction(LOGOUT_USER);

export type LoginUserSuccessPayload = { username; upvotedSongs; id };
export const loginUserSuccess = createAction<LoginUserSuccessPayload>(LOGIN_USER_SUCCESS);

export const playSong = createAction<SongIdPayload>(PLAY_SONG);
export const pauseSong = createAction(PAUSE_SONG);

export type SORT = 'votes' | 'title' | 'artist' | 'playlist' | 'user' | 'duration' | 'date';
export type SetSortPayload = { sort: SORT };
export const setSort = createAction<SetSortPayload>(SET_SORT);
export const shuffleSongs = createAction<PlaylistIdPayload>(SHUFFLE_SONGS);
export const loginUserFailure = createAction<UserPayload>(LOGIN_USER_FAILURE);

export type PlaylistPayload = { playlist };
export const receivePlaylist = createAction<PlaylistPayload>(RECEIVE_PLAYLIST);

/* Thunk Async Actions */

export const requestPlaylist = ({ playlistName, userId }) => async dispatch => {
	try {
		const playlist = await sdk.getPlaylistForName(playlistName);
		dispatch(receivePlaylist({ playlist }));
	} catch (err) {
		// TODO this is a hack for now to add the playlist if it doens't exist
		if (userId) {
			await sdk.createPlaylist({ playlistName, userId });
			const playlist = await sdk.getPlaylistForName(playlistName);
			dispatch(receivePlaylist({ playlist }));
		}
		console.error(err);
	}
};

export const fetchSongs = createAction(FETCH_SONGS, sdk.getSongsInPlaylist);

export const loginUser = (login: any) => async (dispatch: any) => {
	dispatch(requestLogin({ user: login.username }));
	try {
		const user = await sdk.getUser(login.username, 'so secure');
		dispatch(loginUserSuccess({ username: user.username, upvotedSongs: [], id: user.id }));
		localStorage.setItem('login', JSON.stringify(login));
	} catch (error) {
		console.error(error, error.stack);
		dispatch(loginUserFailure(login.username));
	}
};

export const voteSong = createAction(VOTE_SONG, sdk.vote);
export const unvoteSong = createAction(VOTE_SONG, sdk.unvote);
export const deleteSong = createAction(DELETE_SONG, sdk.deleteSong);
