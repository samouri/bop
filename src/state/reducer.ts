import * as _ from 'lodash';
import { combineReducers } from 'redux';
import { Action, handleActions, combineActions } from 'redux-actions';
import { createSelector } from 'reselect';
import * as moment from 'moment';

import {
	ADD_ENTITIES,
	LOGIN_USER_SUCCESS,
	LOGOUT_USER,
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
export const getCurrentSongId = state => state.player.song;
export const getCurrentSort = state => state.player.sort;
export const getCurrentlyPlayingQueue = state => state.player.queue;
// export const getCurrentShuffle = state => state.player.shuffle;
export const getCurrentUser = (state): ApiUser => state.users.byId[state.currentUser] || {};
export const getCurrentPlayer = (state): PlayerState => state.player;
export const getEvents = (state: any) => state.events;

export const getProps = (state, props) => props;
export const getState = state => state;

export const getUserByUsername = (state, username) => {
	const match = _.find(state.users.byId, { username });
	return match;
};

export const getPlaylistByName = createSelector(
	[getProps, getPlaylistEntities, getUserEntities],
	(playlistName, playlistsById, usersById) => {
		const playlist: any = _.find(playlistsById, { name: playlistName });
		if (!playlist) {
			return {};
		}

		return {
			...playlist,
			user: usersById[playlist.user_added],
		};
	}
);

export const getAllSongsDenormalized = createSelector([getSongEntities, getState], (songs, state) =>
	_.map(songs, song => getDenormalizedSong(state, song))
);

export const getSongsInPlaylist = createSelector(
	[getAllSongsDenormalized, getProps],
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

export const sortSongs = (denormalizedSongs: Array<DenormalizedSong>, sort: SORT) => {
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
};

export const getSongsInStream = createSelector(
	[getState, getAllSongsDenormalized, getProps],
	(state, denormalizedSongs: Array<DenormalizedSong>, { type, id, sort = 'date' }) => {
		if (!type) {
			return [];
		}

		let songs;
		if (type === 'playlist') {
			songs = getSongsInPlaylist(state, id);
		} else if (type === 'events') {
			songs = _.map(getEventsDenormalized(state), 'song');
		} else if (type === 'user') {
			songs = _.filter(denormalizedSongs, song => song.user.id === id);
		}
		return sortSongs(songs, sort as any);
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

export const getContributorsInPlaylist = createSelector(
	[getState, getProps, getSongsInPlaylist, getUserEntities],
	(state, playlistId, songs: Array<DenormalizedSong>, usersById) => {
		console.error(playlistId, songs, usersById);
		if (_.isEmpty(songs) || _.isEmpty(usersById)) {
			return [];
		}

		const contribs = _.map(songs, s => s.user.username);
		const counts = _.countBy(contribs);
		const sortedContribs = _.reverse(_.uniq(_.sortBy(contribs, (c: string) => counts[c])));
		return _.take(sortedContribs, 2);
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

export const getEventsDenormalized = createSelector(
	[getState, getEvents, getVoteEntities, getUserEntities],
	(state, events, votesById, usersById) => {
		const allEvents = events.map(event => {
			const user = usersById[event.userAdded];
			if (event.eventType === 'song') {
				return {
					...event,
					song: getDenormalizedSong(state, event),
					user,
				};
			} else if (event.eventType === 'vote') {
				const vote = votesById[event.id];
				if (!vote) {
					return event;
				}
				return {
					...event,
					vote,
					song: getDenormalizedSong(state, { id: vote.song_id }),
					user,
				};
			}
			return { ...event, user };
		});
		// TODO make this smart about multiple events on the same song from multiple people etc etc
		// 4 people liked this song instead of collapsing to this garbage
		return _.uniqBy(
			_.filter(allEvents, (event: any) => event.eventType !== 'playlist'),
			evt => evt.song && evt.song.id
		);
	}
);

const playlists = combineReducers({
	byId: playlistsById,
});

const playerSort = handleActions(
	{ [SET_SORT]: (state, action: Action<SetSortPayload>) => action.payload!.sort },
	'date'
);
const playerShuffle = handleActions({ [SHUFFLE_SONGS]: state => !state }, false);
const playerPlaying = handleActions({ [PLAY_SONG]: () => true, [PAUSE_SONG]: () => false }, false);

const playerSong = handleActions(
	{
		[PLAY_SONG]: (state, action: any) => {
			return action.payload.songId ? action.payload.songId : state;
		},
	},
	null
);

export type Stream = {
	type: 'playlist' | 'event' | 'user';
	id: number;
};

const playerQueue = handleActions(
	{
		[PLAY_SONG]: (state, action: any) => {
			if (action.payload.stream) {
				return _.merge({}, state, action.payload.stream);
			}
			return state;
		},
	},
	{}
);

export type PlayerState = {
	sort: SORT;
	songId: number;
	shuffle: boolean;
	playing: boolean;
	queue: { type: string; id: number };
};
const player = combineReducers({
	sort: playerSort,
	songId: playerSong,
	shuffle: playerShuffle,
	playing: playerPlaying,
	queue: playerQueue,
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
	{
		[LOGIN_USER_SUCCESS]: (state, action: any) => action.payload.id,
		[LOGOUT_USER]: () => null,
	},
	null
);

const users = combineReducers({ byId: usersById, current: currentUser });

const events = handleActions(
	{
		[FETCH_EVENTS]: (state: any, action: Action<EventsPayload>) => {
			if (action.error) {
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

export const getPlayQueue = createSelector(
	[getState, getCurrentlyPlayingQueue],
	(state, stream) => {
		return getSongsInStream(state, stream);
	}
);

export const getCurrentSong = createSelector(
	[getCurrentPlayer, getAllSongsDenormalized],
	(player, songs) => _.find(songs, { id: player.songId })
);

export const getNextSong = createSelector(
	[getPlayQueue, getCurrentPlayer],
	(denormalizedSongs: Array<DenormalizedSong>, player: PlayerState) => {
		const { songId, shuffle } = player;
		const songs = shuffle ? _.shuffle(denormalizedSongs) : denormalizedSongs;
		const currIndex = _.findIndex(songs, song => song.id === songId);

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
