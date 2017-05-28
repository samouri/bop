// @flow
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
import { createActionThunk } from './utils';
export const LOAD_PLAYLIST = 'LOAD_PLAYLIST';

/* action creators */
export const setPlaylistName = playlistName => ({
	type: SET_PLAYLIST_NAME,
	payload: {
		name: playlistName,
	},
});

export const logout = user => ({
	type: LOGOUT_USER,
	meta: { user },
});

export const playSong = songId => ({
	type: PLAY_SONG,
	songId,
});

export const pauseSong = songId => ({
	type: PAUSE_SONG,
	songId,
});

export const setSort = sort => ({
	type: SET_SORT,
	sort,
});

export const shuffleSongs = playlistId => ({
	type: SHUFFLE_SONGS,
	payload: {
		playlist: { id: playlistId },
	},
});

export const addSongToPlaylist = (song, playlistId) => ({
	type: ADD_SONG_TO_PLAYLIST,
	playlistId,
});

export const receivePlaylist = playlist => ({
	type: RECEIVE_PLAYLIST,
	payload: { playlist },
});

/* Thunk Async Actions */

const requestPlaylist = (playlistName: string) => {
	const sdk = window.sdk;
	return createActionThunk({
		type: LOAD_PLAYLIST,
		dataFetch: () => sdk.getPlaylistForName(playlistName),
		meta: { playlistName },
	});
};

export const fetchSongs = (playlistId: number) => {
	const sdk = window.sdk;
	return createActionThunk({
		type: LOAD_SONGS,
		dataFetch: () => sdk.getSongsInPlaylist({ playlistId, offset: 0, limit: 200 }),
		meta: { playlistId },
	});
};

export const loginUser = (login: object) => {
	const sdk = window.sdk;
	return createActionThunk({
		type: LOGIN_USER,
		dataFetch: () => sdk.getUser(login.username),
		meta: { playlistId },
		onSuccess: () => localStorage.setItem('login', JSON.stringify(login)),
	});
};

// TODO actually make this async correctly
export const voteSong = (song, dir) => {
	const sdk = window.sdk;
	return createActionThunk({
		type: VOTE_SONG,
		meta: { dir, song },
		dataFetch: () => sdk.vote(song.playlist_id, song.youtube_id, dir),
	});
};

export const deleteSong = song => {
	const sdk = window.sdk;
	return createActionThunk({
		type: DELETE_SONG,
		meta: { song },
		dataFetch: () => sdk.deleteSong(song.id),
	});
};
