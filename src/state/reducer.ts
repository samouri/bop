import * as _ from 'lodash';
import { combineReducers } from 'redux';
import { Action, handleActions, combineActions } from 'redux-actions';
import { createSelector } from 'reselect';
import * as moment from 'moment';

import {
	ADD_ENTITIES,
	LOGIN_USER_SUCCESS,
	PLAY_SONG,
	PAUSE_SONG,
	SET_SORT,
	SHUFFLE_SONGS,
	DELETE_SONG,
	RECEIVE_PLAYLIST,
	SET_PLAYLIST,
	SetSortPayload,
	SORT,
	FETCH_EVENTS,
	EventsPayload,
} from './actions';
import { ApiSongs, ApiMetadata, ApiPlaylists, ApiVotes, ApiUser } from '../sdk';

// Selectors first
export const getMetadataEntities = state => state.metadata.byId;
export const getUserEntities = state => state.users.byId;
export const getSongEntities = state => state.songs.byId;
export const getVoteEntities = state => state.votes.byId;
export const getPlaylistEntities = state => state.playlists.byId;
export const getCurrentPlaylistId = state => state.player.playlist;
export const getCurrentSongId = state => state.player.song;
export const getCurrentSort = state => state.player.sort;
export const getCurrentShuffle = state => state.player.shuffle;
export const getCurrentUser = (state): ApiUser => state.users.byId[state.currentUser] || {};
export const getCurrentPlayer = (state): PlayerState => state.player;

export const getProps = (state, props) => props;
export const getState = state => state;

export const getCurrentPlaylist = createSelector(
	[getCurrentPlaylistId, getPlaylistEntities, getUserEntities],
	(playlistId, playlistsById, usersById) => {
		const playlist = playlistsById[playlistId];
		if (!playlist) {
			return {};
		}

		return {
			...playlist,
			user: usersById[playlist.user_added],
		};
	}
);

export const getSongsInPlaylist = createSelector(
	[getSongEntities, getProps],
	(songs, playlistId) => {
		if (playlistId === 17) {
			// all
			return songs;
		}
		return _.filter(songs, (song: ApiSongs) => song.playlist_id === playlistId);
	}
);
export const getMetadataForSong = createSelector(
	[getMetadataEntities, getSongEntities, getProps],
	(metadata, songs, songId) => {
		const metadataId = songs[songId].metadata_id;
		return metadata[metadataId];
	}
);

export const getSongsInCurrentPlaylist = createSelector(
	[getState, getCurrentPlaylist],
	(state, playlist) => {
		console.error(state, playlist);
		return getSongsInPlaylist(state, playlist.id);
	}
);

export type DenormalizedSong = ApiSongs & {
	metadata: ApiMetadata;
	votes: Array<ApiVotes>;
	user: ApiUser;
	playlists: ApiPlaylists;
};

export const getDenormalizedSong = createSelector([getState, getProps], (state, { id }) => {
	const song = state.songs.byId[id];
	if (!song) {
		return null;
	}

	return {
		...song,
		metadata: getMetadataForSong(state, song.id),
		user: state.users.byId[song.user_added!],
		playlists: state.playlists.byId[song.playlist_id!],
		votes: _.filter(state.votes.byId, (vote: ApiVotes) => vote.song_id === song.id),
	};
});

export const getAllSongsDenormalized = createSelector([getSongEntities, getState], (songs, state) =>
	_.map(songs, song => getDenormalizedSong(state, song))
);

export const getSortedSongsDenormalized = createSelector(
	[getSongsInCurrentPlaylist, getCurrentSort, getState],
	(songs, sort: SORT, state) => {
		if (!songs) {
			return songs;
		}

		const denormalizedSongs: Array<DenormalizedSong> = _.map(songs, song =>
			getDenormalizedSong(state, song)
		);
		switch (sort) {
			case 'votes':
				return _.reverse(_.sortBy(denormalizedSongs, song => song.votes.length));
			case 'date':
				return _.reverse(_.sortBy(denormalizedSongs, song => song.date_added));
			case 'duration':
				return _.sortBy(denormalizedSongs, (song: any) =>
					moment.duration(song.metadata.youtube_duration).asSeconds()
				);
			case 'title':
				return _.sortBy(denormalizedSongs, song => song.metadata.title);
			case 'artist':
				return _.sortBy(denormalizedSongs, song => song.metadata.artist);
			case 'playlist':
				return _.sortBy(denormalizedSongs, song => song.playlists.name);
			case 'user':
				return _.sortBy(denormalizedSongs, song => song.user.username);
		}
	}
);

// @todo: calc based on votes instead of based on denormalized songs
export const getUpvotedSongs = createSelector(
	[getCurrentUser, getAllSongsDenormalized, getVoteEntities],
	(user: ApiUser, songs) =>
		_.filter(songs, (song: DenormalizedSong) =>
			_.some(song.votes, vote => vote.user_added === user.id)
		)
);

export const getShuffledSongsInPlaylist = createSelector([getSortedSongsDenormalized], songs =>
	_.shuffle(songs)
);

export const getContributorsInCurrentPlaylist = createSelector(
	[getSongsInCurrentPlaylist, getUserEntities, getState],
	(songs, usersById, state) => {
		if (_.isEmpty(songs) || _.isEmpty(usersById)) {
			return [];
		}

		const denormalizedSongs: Array<DenormalizedSong> = _.map(songs, song =>
			getDenormalizedSong(state, song)
		);
		console.error(denormalizedSongs);
		const contribs = _.map(denormalizedSongs, s => s.user.username);
		const counts = _.countBy(contribs);
		const sortedContribs = _.reverse(_.uniq(_.sortBy(contribs, (c: string) => counts[c])));
		return _.take(sortedContribs, 2);
	}
);

export const getPlayQueue = createSelector(
	[getSortedSongsDenormalized, getCurrentShuffle],
	(songs, shuffle) => {
		if (shuffle) {
			return _.shuffle(songs);
		}
		return songs;
	}
);

export const getNextSong = createSelector(
	[getPlayQueue, getCurrentSongId],
	(songs: Array<DenormalizedSong>, currSongId) => {
		const currIndex = _.findIndex(songs, song => song.id === currSongId);
		if (currIndex === -1) {
			return songs[0];
		}
		return songs[currIndex + 1];
	}
);
export const getPrevSong = createSelector(
	[getPlayQueue, getCurrentSongId],
	(songs: Array<DenormalizedSong>, currSongId) => {
		const currIndex = _.findIndex(songs, song => song.id === currSongId);
		if (currIndex === -1 || currIndex === 0) {
			return songs[songs.length - 1];
		}
		return songs[currIndex - 1];
	}
);

const songsById = handleActions(
	{
		[ADD_ENTITIES]: (state, action: Action<{ songs: any }>) => {
			if (!action.payload!.songs) {
				return state;
			}
			return { ...state, ...action.payload!.songs };
		},
		[DELETE_SONG]: (state, action: any) => {
			return _.omit(state, action.payload.song.id);
		},
	},
	{}
);

const songs = combineReducers({
	byId: songsById,
});

const metadataById = handleActions(
	{
		[ADD_ENTITIES]: (state, action: any) => {
			if (!action.payload.metadata) {
				return state;
			}
			return { ...state, ...action.payload.metadata };
		},
	},
	{}
);
const metadata = combineReducers({
	byId: metadataById,
});

const playlistsById = handleActions(
	{
		[combineActions(ADD_ENTITIES, RECEIVE_PLAYLIST, SET_PLAYLIST) as any]: (state, action: any) => {
			if (!action.payload.playlists) {
				return state;
			}

			return {
				...state,
				...action.payload.playlists,
			};
		},
	},
	{}
);

const playlists = combineReducers({
	byId: playlistsById,
});

const playerSort = handleActions(
	{ [SET_SORT]: (state, action: Action<SetSortPayload>) => action.payload!.sort },
	'date'
);
const playerShuffle = handleActions({ [SHUFFLE_SONGS]: state => !state }, false);
const playerPlaylist = handleActions(
	{ [SET_PLAYLIST]: (state, action: any) => action.payload.playlist.id },
	null
);
const playerPlaying = handleActions({ [PLAY_SONG]: () => true, [PAUSE_SONG]: () => false }, false);
const playerSong = handleActions(
	{
		[PLAY_SONG]: (state, action: any) => {
			return action.payload.songId ? action.payload.songId : state;
		},
	},
	null
);

export type PlayerState = {
	sort: SORT;
	song: number;
	shuffle: boolean;
	playlist: number;
	playing: boolean;
};
const player = combineReducers({
	sort: playerSort,
	song: playerSong,
	shuffle: playerShuffle,
	playlist: playerPlaylist,
	playing: playerPlaying,
});

const usersById = handleActions(
	{
		[ADD_ENTITIES]: (state, action: any) => {
			if (!action.payload.users) {
				return state;
			}
			return { ...state, ...action.payload.users };
		},
	},
	{}
);

const votesById = handleActions(
	{
		[ADD_ENTITIES]: (state, action: any) => {
			if (!action.payload.votes) {
				return state;
			}
			return { ...state, ...action.payload.votes };
		},
	},
	{}
);
const votes = combineReducers({ byId: votesById });

const currentUser = handleActions(
	{ [LOGIN_USER_SUCCESS]: (state, action: any) => action.payload.id },
	null
);

const users = combineReducers({ byId: usersById, current: currentUser });

export const getEvents = (state: any) => state.events;

const events = handleActions(
	{
		[FETCH_EVENTS]: (state: any, action: Action<EventsPayload>) => {
			if (action.error) {
				console.error('FETCH_EVENT error!', action.error);
				return state;
			}
			const newEvents = _.map(action.payload, event =>
				_.mapKeys(event, (val, key) => _.camelCase(key + ''))
			);
			return _.uniq(_.concat(state, newEvents));
		},
	},
	[]
);

const BopApp = combineReducers({
	events,
	metadata,
	songs,
	playlists,
	player,
	users,
	currentUser,
	votes,
});

// App Reducer
export default BopApp;
