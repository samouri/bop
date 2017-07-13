// @flow
import { createActionThunk } from './utils';

export const ADD_SONG_TO_PLAYLIST = 'ADD_SONG_TO_PLAYLIST';
export const LOAD_SONGS = 'LOAD_SONGS';
export const LOGIN_USER = 'LOGIN_USER';
export const LOGOUT_USER = 'LOGOUT_USER';
export const PLAY_SONG = 'PLAY_SONG';
export const PAUSE_SONG = 'PAUSE_SONG';
export const VOTE_SONG = 'VOTE_SONG';
export const SET_SORT = 'SET_SORT';
export const DELETE_SONG = 'DELETE_SONG';
export const SHUFFLE_SONGS = 'SHUFFLE_SONGS';
export const SET_PLAYLIST_NAME = 'SET_PLAYLIST_NAME';
export const LOAD_PLAYLIST = 'LOAD_PLAYLIST';

/* flow types */

export type Action = { type: ActionType; payload?: Object; meta?: Object; error?: boolean };
export type ActionType =
	| 'ADD_SONG_TO_PLAYLIST'
	| 'LOAD_SONGS'
	| 'SET_PLAYLIST_NAME'
	| 'PLAY_SONG'
	| 'PAUSE_SONG'
	| 'LOGOUT_USER'
	| 'SHUFFLE_SONGS'
	| 'SET_SORT';

type SongId = number;
type PlaylistId = number;
type SORT = 'top' | 'new';

/* action creators */
export const setPlaylistName = (playlistName: string): Action => ({
	type: SET_PLAYLIST_NAME,
	payload: {
		name: playlistName,
	},
});

export const logout = (): Action => ({ type: LOGOUT_USER });
export const playSong = (songId: SongId) => ({ type: PLAY_SONG, songId });
export const pauseSong = (songId: SongId) => ({ type: PAUSE_SONG, songId });
export const setSort = (sort: SORT): Action => ({ type: SET_SORT, meta: { sort } });

export const shuffleSongs = (playlistId: PlaylistId): Action => ({
	type: SHUFFLE_SONGS,
	payload: {
		playlist: { id: playlistId },
	},
});

export const addSongToPlaylist = (song: Object, playlistId: PlaylistId): Action => ({
	type: ADD_SONG_TO_PLAYLIST,
	meta: { playlistId, song },
});

/* Thunk Async Actions */

export const requestPlaylist = (playlistName: string) => {
	const sdk = window.sdk;
	return createActionThunk({
		type: LOAD_PLAYLIST,
		dataFetch: () => sdk.getPlaylistForName(playlistName),
		meta: { playlistName },
	});
};

export const fetchSongs = (playlistId: PlaylistId) => {
	const sdk = window.sdk;
	return createActionThunk({
		type: LOAD_SONGS,
		dataFetch: () => sdk.getSongsInPlaylist({ playlistId, offset: 0, limit: 200 }),
		meta: { playlistId },
	});
};

export const loginUser = (login: { username: string }) => {
	const sdk = window.sdk;
	return createActionThunk({
		type: LOGIN_USER,
		dataFetch: () => sdk.getUser(login.username),
		meta: { username: login.username },
		onSuccess: () => localStorage.setItem('login', JSON.stringify(login)),
	});
};

// TODO actually make this async correctly
export const voteSong = (songId: Number, dir: Number) => {
	const sdk = window.sdk;
	return createActionThunk({
		type: VOTE_SONG,
		meta: { dir, songId },
		dataFetch: () => sdk.vote(songId, dir),
	});
};

export const deleteSong = (songId: SongId) => {
	const sdk = window.sdk;
	return createActionThunk({
		type: DELETE_SONG,
		meta: { songId },
		dataFetch: () => sdk.deleteSong(songId),
	});
};
