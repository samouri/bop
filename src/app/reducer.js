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

import _ from 'lodash';
import { combineReducers } from 'redux';

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
  LOGOUT_USER,
} from './actions';

const songsInitialState = {
  isFetching: false,
  didInvalidate: false,
  page: 0,
  songs: [],
}

function songsById( state = {}, action ) {
  if ( action.type === FETCH_SONGS_SUCCESS ) {
    const fetchedSongs = _.mapKeys( action.songs, ( song ) => song._id );

    return {
      ...state,
      ...fetchedSongs,
    };
  }
  return state
}

function songs( state = songsInitialState, action ) {
	switch( action.type ) {
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
	      songs: _.uniq( [ ..._.map( action.songs, '_id'), ...state.songs ] ),
	    };
		default:
			return state
	}
}

function playlists( state = {}, action ) {
	switch( action.type ) {
		case FETCH_SONGS_REQUEST:
		case FETCH_SONGS_SUCCESS:
		case FETCH_SONGS_FAILURE:
	    return {
	      ...state,
	      [ action.playlistId ]: songs( state[ action.playlistId ], action ),
	    };
		default:
			return state;
	}
}

const initialCurrentPlaylist = _.isEmpty( window.location.pathname.substring(1) )
	? 'Seattle'
	: window.location.pathname.substring(1);

function currentPlaylist( state = initialCurrentPlaylist, action ) {
	return state;
}

function currentSort( state = 'top', action ) {
	if ( action.type === SET_SORT ) {
		return action.sortType;
	}

	return state;
}

function currentSong( state = null, action ) {
	if ( action.type === PLAY_SONG ) {
		const invalidatedSong = ! state || state.songId !== action.songId;
		return { songId: action.songId, playing: true, invalidatedSong, };
	} else if ( action.type === PAUSE_SONG ) {
		return { ...state, playing: false };
	}

	return state;
}

function user( state = {}, action ) {
	switch( action.type ) {
		case LOGIN_USER_REQUEST:
			return { ...state, isFetching: true, };
		case LOGIN_USER_FAILURE:
			return { ...state, isFetching: false };
		case LOGIN_USER_SUCCESS:
			return {
				...state,
				isFetching: false,
				upvotedSongs: action.upvotedSongs,
				username: action.username
			};
		case VOTE_SONG:
			// if already upvoted, then remove.  if not upvoted, then keep
			let upvotedSongs;
			if ( _.has( state.upvotedSongs, action.songId ) ) {
				upvotedSongs = _.omit( state.upvotedSongs, action.songId )
			} else {
				upvotedSongs = {
					[action.songId]: true,
					...state.upvotedSongs,
				}
			}

			return { ...state, upvotedSongs, };
		case LOGOUT_USER:
			localStorage.removeItem( 'login' );
			return { ...state, username: null, upvotedSongs: {}, };
		default:
			return state;
	}
}

const BopApp = combineReducers( {
  songsById,
  playlists,
	currentPlaylist,
	currentSort,
	currentSong,
	user,
} )

// App Reducer
export default BopApp;

// Selectors

function getSongsForPlaylist( state, playlistId ) {
	const playlist = state.playlists[ playlistId ];
	if( playlist ) {
		const songIds = playlist.songs;
		const songs = _.map( songIds, (songId) => state.songsById[ songId ] );
		return songs;
	}
	return [];
}


export function getSongById( state, id ) {
	return state.songsById[ id ];
}

export function getUpvotedSongs( state ) {
	if ( state.user && state.user.upvotedSongs ) {
		return state.user.upvotedSongs;
	}
	return [];
}

export function getUsername( state ) {
	if ( state.user && state.user.username ) {
		return state.user.username;
	}
	return null;
}

export function getCurrentPlaylist( state ) {
	return state.currentPlaylist;
}

export function getCurrentSong( state ) {
	return state.currentSong;
}

export function getCurrentSort( state ) {
	return state.currentSort;
}

export function getSongs( state ) {
	return getSongsForPlaylist( state, getCurrentPlaylist( state) );
}

const TOP = 'top';
const NEW = 'new';
export function getSortedSongs( state ) {
	const songs = getSongs( state );
	const sort = getCurrentSort( state );

	if ( sort === TOP ) {
		return _.reverse( _.sortBy( songs, [ 'upvotes', 'creation_date' ] ) );
	} else if ( sort === NEW ) {
 		return _.reverse( _.sortBy( songs, [ 'creation_date', 'upvotes' ] ) );
	}
}

export function getNextSong( state ) {
	const currentSong = getCurrentSong( state );
	const songs = getSortedSongs( state );
	var currIndex = _.findIndex( songs, currentSong.songIds );

	return songs[ currIndex + 1 ]._id;
}
