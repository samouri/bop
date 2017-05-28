// @flow
import _ from 'lodash';
import { combineReducers } from 'redux';
import type { Action } from './actions';

/**
 * state = {
 * 	users: { 
 * 		id, parties[ ids, ], upvoted = [ songIds ], playlists = [ playlistIds ],
 * 		username, followers, upvotes, postedsongs
 *  }
 *  parties: {
 *		[ id ]: {
 *			id, name,date_added, added_by
 *		}
 *  }
 * 	songs: {
 *    metadata...  
 *  }
 *  playlists: {
 *    [ id ] : { ...}
 *  } 
 * }
 */

type SORT = 'top' | 'new';
export type Reducer<S, A: Action> = (S, A) => S;

import {
	FETCH_SONGS_REQUEST,
	FETCH_SONGS_SUCCESS,
	FETCH_SONGS_FAILURE,
	LOGIN_USER_REQUEST,
	LOGIN_USER_SUCCESS,
	LOGIN_USER_FAILURE,
	PLAY_SONG,
	PAUSE_SONG,
	VOTE_SONG,
	SET_SORT,
	SHUFFLE_SONGS,
	LOGOUT_USER,
	DELETE_SONG,
	RECEIVE_PLAYLIST,
	SET_PLAYLIST_NAME,
} from './actions';

const songsInitialState = {
	isFetching: false,
	didInvalidate: false,
	page: 0,
	songs: [],
};

type SongsByIdState = { [id: number]: Object };
const songsById = createReducer(
	{},
	{
		[FETCH_SONGS_SUCCESS]: (state: SongsByIdState, action): SongsByIdState => {
			return {
				...state,
				..._.mapKeys(action.songs, 'id'),
			};
		},
	}
);

// const songsById = (state: SongsByIdState = {}, action): SongsByIdState => {
// 	if (action.type === FETCH_SONGS_SUCCESS) {
// 		const fetchedSongs = _.mapKeys(action.songs, 'id');

// 		return {
// 			...state,
// 			...fetchedSongs,
// 		};
// 	}
// 	return state;
// };

type SongsState = {
	isFetching: boolean,
	didInvalidate: boolean,
	page: number,
	songs: Array<any>,
};
const songs = (state: SongsState = songsInitialState, action): SongsState => {
	switch (action.type) {
		case FETCH_SONGS_REQUEST:
			return {
				...state,
				isFetching: true,
			};
		case FETCH_SONGS_FAILURE:
			return {
				...state,
				isFetching: false,
				didInvalidate: true,
			};
		case FETCH_SONGS_SUCCESS:
			return {
				...state,
				isFetching: false,
				didInvalidate: false,
				songs: _.uniq([..._.map(action.songs, 'id'), ...state.songs]),
			};
		case DELETE_SONG:
			console.error(
				action.song.id,
				state.songs,
				_.without(state.songs, action.song.id),
				_.filter(state.songs, id => id !== action.song.id)
			);
			return {
				...state,
				songs: _.without(state.songs, action.song.id),
			};
		case SHUFFLE_SONGS:
			return {
				...state,
				shuffledSongs: _.shuffle(state.songs),
			};
		default:
			return state;
	}
};

type PlaylistsState = any;
const playlists = (state: PlaylistsState = {}, action): PlaylistsState => {
	const playlist = action.payload && action.payload.playlist;
	switch (action.type) {
		case RECEIVE_PLAYLIST:
			return {
				...state,
				[playlist.id]: Object.assign({}, state[playlist.id], playlist, songs(undefined, action)),
			};
		case FETCH_SONGS_REQUEST:
		case FETCH_SONGS_SUCCESS:
		case FETCH_SONGS_FAILURE:
		case SHUFFLE_SONGS:
		case DELETE_SONG:
			return {
				...state,
				[playlist.id]: songs(state[playlist.id], action),
				'17': songs(state[17], action),
			};
		default:
			return state;
	}
};

type CurrentPlaylistNameState = string;
const currentPlaylistName = (
	state: CurrentPlaylistNameState = 'All',
	action
): CurrentPlaylistNameState => {
	if (action.type === SET_PLAYLIST_NAME) {
		return action.payload.name;
	}
	return state;
};

type CurrentSortState = { sort: SORT, shuffle: boolean };
const currentSort = (
	state: CurrentSortState = { sort: 'new', shuffle: false },
	action
): CurrentSortState => {
	if (action.type === SET_SORT) {
		return {
			...state,
			sort: action.sort,
		};
	} else if (action.type === SHUFFLE_SONGS) {
		return {
			...state,
			shuffle: !state.shuffle,
		};
	}

	return state;
};

type CurrentSongState = null | { songId: string, playing: boolean, invalidatedSong: boolean };
const currentSong = (state: CurrentSongState = null, action): CurrentSongState => {
	if (action.type === PLAY_SONG) {
		const invalidatedSong = !state || state.songId !== action.songId;
		return { songId: action.songId, playing: true, invalidatedSong };
	} else if (action.type === PAUSE_SONG) {
		return { ...state, playing: false };
	}

	return state;
};

type UserState = {
	+isFetching?: boolean,
	+id?: string,
	+username?: string,
	+upvotedSongs?: { any?: boolean },
};

const user = (state: UserState = {}, action): UserState => {
	switch (action.type) {
		case LOGIN_USER_REQUEST:
			return { ...state, isFetching: true };
		case LOGIN_USER_FAILURE:
			return { ...state, isFetching: false };
		case LOGIN_USER_SUCCESS:
			return {
				...state,
				isFetching: false,
				upvotedSongs: action.upvotedSongs,
				username: action.username,
				id: action.id,
			};
		case VOTE_SONG:
			const upvotedSongs = {
				...(state.upvotedSongs || {}),
				[action.songId]: !_.has(state.upvotedSongs, action.songId),
			};

			return { ...state, upvotedSongs };
		case LOGOUT_USER:
			localStorage.removeItem('login');
			return { ...state, username: undefined, upvotedSongs: {} };
		default:
			return state;
	}
};

type SUB_STATE =
	| SongsByIdState
	| PlaylistsState
	| CurrentSongState
	| CurrentSortState
	| CurrentSongState
	| UserState;
type STATE = {
	songsById: SongsByIdState,
	playlists: PlaylistsState,
	currentPlaylistName: CurrentSongState,
	currentSort: CurrentSortState,
	currentSong: CurrentSongState,
	user: UserState,
};
const BopApp = combineReducers({
	songsById,
	playlists,
	currentPlaylistName,
	currentSort,
	currentSong,
	user,
});

// App Reducer
export default BopApp;

// Selectors

function getSongsInPlaylist(state: STATE, playlist) {
	if (!playlist) {
		return [];
	}

	const songIds = playlist.songs;
	const songs = _.map(songIds, songId => state.songsById[songId]);
	return songs;
}

export function getSongById(state: STATE, id: number) {
	return state.songsById[id];
}

export function getUpvotedSongs(state: STATE) {
	if (state.user && state.user.upvotedSongs) {
		return state.user.upvotedSongs;
	}
	return [];
}

export function getUsername(state: STATE) {
	if (state.user && state.user.username) {
		return state.user.username;
	}
	return null;
}

export const getUser = (state: STATE) => state.user;
export const getCurrentPlaylistName = (state: STATE) => state.currentPlaylistName;
export const getCurrentSong = (state: STATE) => state.currentSong;
export const getCurrentSort = (state: STATE) => state.currentSort;
export const getCurrentPlaylist = (state: STATE) =>
	_.find(state.playlists, { name: getCurrentPlaylistName(state) });

export const getSongs = (state: STATE) => getSongsInPlaylist(state, getCurrentPlaylist(state));
export const getShuffledSongsInPlaylist = (state: STATE, playlistId: number) => {
	const playlist = state.playlists[playlistId];

	if (playlist) {
		return playlist.shuffledSongs;
	}
	return [];
};

export const getSortedSongs = (state: STATE) => {
	const songs = getSongs(state);
	const sort: SORT = getCurrentSort(state).sort;

	if (sort === 'top') {
		return _.reverse(_.sortBy(songs, song => song.votes.length));
	} else if (sort === 'new') {
		return _.reverse(_.sortBy(songs, song => song.date_added));
	}
};

export const getNextSong = (state: STATE) => {
	const currentSong = getCurrentSong(state);
	let songs = _.map(getSortedSongs(state), 'id');
	if (getCurrentSort(state).shuffle) {
		songs = getShuffledSongsInPlaylist(state, getCurrentPlaylist(state).id);
	}

	if (currentSong === null) {
		return null;
	}

	var currIndex = songs.indexOf(currentSong.songId);
	return songs[currIndex + 1];
};