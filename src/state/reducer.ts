/*
 State Shape:

	App: {
    selectedPlayist: 'Seattle',
		songsById: { id1: song1, ... },
		playlists: {
			Seatle: {
        isFetching: true,
        didInvalidate: false,
        page?: false,
        songIds: [ array of songIds ],
      }
			...
		},
		user: {
			upvoted: [ array of songIds ]
			name: username
		}
	}
 */

import * as _ from 'lodash';
import { combineReducers } from 'redux';

const TOP = 'top';
const NEW = 'new';

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

function songsById(state = {}, action: any) {
	if (action.type === FETCH_SONGS_SUCCESS) {
		const fetchedSongs = _.mapKeys(action.songs, 'id');

		return {
			...state,
			...fetchedSongs,
		};
	}
	return state;
}

function songs(state = songsInitialState, action: any) {
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
			return {
				...state,
				songs: _.without(state.songs, action.songId),
			};
		case SHUFFLE_SONGS:
			return {
				...state,
				shuffledSongs: _.shuffle(state.songs),
			};
		default:
			return state;
	}
}

function playlists(state = {}, action: any) {
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
				[17]: songs(state[17], action),
			};
		default:
			return state;
	}
}

function currentPlaylistName(state = 'All', action: any) {
	if (action.type === SET_PLAYLIST_NAME) {
		return action.payload.name;
	}
	return state;
}

function currentSort(state = { sort: TOP, shuffle: false }, action: any) {
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
}

function currentSong(state: any = null, action: any) {
	if (action.type === PLAY_SONG) {
		const invalidatedSong = !state || state.songId !== action.songId;
		return { songId: action.songId, playing: true, invalidatedSong };
	} else if (action.type === PAUSE_SONG) {
		return { ...state, playing: false };
	}

	return state;
}

function user(state: any = {}, action: any) {
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
			// if already upvoted, then remove.  if not upvoted, then keep
			let upvotedSongs;
			if (_.has(state.upvotedSongs, action.songId)) {
				upvotedSongs = _.omit(state.upvotedSongs, action.songId);
			} else {
				upvotedSongs = {
					[action.songId]: true,
					...state.upvotedSongs,
				};
			}

			return { ...state, upvotedSongs };
		case LOGOUT_USER:
			localStorage.removeItem('login');
			return { ...state, username: null, upvotedSongs: {} };
		default:
			return state;
	}
}

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

function getSongsInPlaylist(state: any, playlist: any) {
	if (!playlist) {
		return [];
	}

	const songIds = playlist.songs;
	const songs = _.map(songIds, (songId: number) => state.songsById[songId]);
	return songs;
}

export const getPlaylistById = (state: any, playlistId) => _.get(state.playlists, playlistId);

export function getSongById(state: any, id: any) {
	return state.songsById[id];
}

export function getUpvotedSongs(state: any) {
	if (state.user && state.user.upvotedSongs) {
		return state.user.upvotedSongs;
	}
	return [];
}

export function getUsername(state: any) {
	if (state.user && state.user.username) {
		return state.user.username;
	}
	return null;
}

export const getUser = (state: any) => state.user;

export function getCurrentPlaylistName(state: any) {
	return state.currentPlaylistName;
}

export function getCurrentSong(state: any) {
	return state.currentSong;
}

export function getCurrentSort(state: any) {
	return state.currentSort;
}

export const getCurrentPlaylist: any = (state: any) =>
	_.find(state.playlists, { name: getCurrentPlaylistName(state) });

export function getSongs(state: any) {
	return getSongsInPlaylist(state, getCurrentPlaylist(state));
}

export function getShuffledSongsInPlaylist(state: any, playlistId: string) {
	const playlist = state.playlists[playlistId];

	if (playlist) {
		return playlist.shuffledSongs;
	}
	return [];
}

export function getSortedSongs(state: any): any {
	const songs = getSongs(state);
	const sort = getCurrentSort(state).sort;

	if (sort === TOP) {
		return _.reverse(_.sortBy(songs, song => song.votes.length));
	} else if (sort === NEW) {
		return _.reverse(_.sortBy(songs, song => song.date_added));
	}
}

export function getNextSong(state: any) {
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
}