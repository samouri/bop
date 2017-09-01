import config from './config';
import * as _ from 'lodash';
import * as fetch from 'isomorphic-fetch';
import * as moment from 'moment';
window.moment = moment;

import * as api from './generated/api';
import { normalize, schema } from 'normalizr';

const metadata = new schema.Entity('metadata');
const user = new schema.Entity('users');
const playlist = new schema.Entity('playlists');
const vote = new schema.Entity('votes');
const song = new schema.Entity('songs', {
	metadata,
	playlists: playlist,
	votes: [vote],
	user,
});

declare global {
	interface Window {
		swagger: any;
		moment: any;
		sdk: any;
		swaggerClient: any;
		api: any;
	}
}

type Event = {
	id: number;
	date_added: string;
	event_type: 'song' | 'playlist' | 'vote';
	user_added: number;
};

export const mapLastFmItemToBop = (song: any) => {
	return _.pickBy({
		artist: song.artist,
		title: song.name,
		album: '',
		thumbnail_url: song.image[3]['#text'],
		mbid: song.mbid, // musicbrainz id
	});
};

export const mapMusicBrainzItemtoBop = (song: any) => {
	return _.pickBy({
		title: song.title,
		album: song.releases[0].title,
		artist: song['artist-credit'][0].artist.name,
		mbid: song.id, // musicbrainz id
		score: song.score,
	});
};

class BopSdk {
	getSongsInPlaylist = async ({ playlistId, offset = 0, limit = 5000 }) => {
		// hardcoded all playlist
		if (playlistId === 17) {
			return this.getSongsInAllPlaylist({ offset, limit });
		}

		const getSongs = api.SongsApiFp.songsGet({
			playlistId: `eq.${playlistId}`,
			offset: offset.toString(),
			limit: limit.toString(),
			select: '*,metadata{*},votes{*},user{id,username},playlists{*}',
		});
		const songs = await (await getSongs(fetch, config.swaggerHost)).json();
		const normalized = normalize(songs, [song]);
		return { ...normalized.entities };
	};

	//todo need better system
	getSongsInAllPlaylist = async ({ offset, limit = 5000 }): Promise<any> => {
		const getSongs = api.SongsApiFp.songsGet({
			offset: offset.toString(),
			limit: limit.toString(),
			select: '*,metadata{*},votes{*},user{id,username},playlists{*}',
		});
		const songs = await (await getSongs(fetch, config.swaggerHost)).json();
		const normalized = normalize(songs, [song]);

		return { ...normalized.entities };
	};

	getSongsAddedByUser = async ({ userId, limit = 5000, offset = 0 }) => {
		const getSongs = api.SongsApiFp.songsGet({
			id: `eq.${userId}`,
			offset: offset.toString(),
			limit: limit.toString(),
			select: '*,songs{*}',
		});
		const resp = await getSongs(fetch, config.swaggerHost);
		return resp.json();
	};

	createPlaylist = async ({ playlistName, userId }: { playlistName: string; userId: number }) => {
		const playlist: api.Playlists = { name: playlistName, user_added: userId };
		const resp = await api.PlaylistsApiFp.playlistsPost({
			body: playlist,
		})(fetch, config.swaggerHost);

		return resp.json();
	};

	getPlaylistForName = async (playlistName: string): Promise<any> => {
		const getPlaylists = api.PlaylistsApiFp.playlistsGet({
			name: `eq.${encodeURIComponent(playlistName)}`,
			select: '*,users{*}',
		});
		const resp = await getPlaylists(fetch, config.swaggerHost);
		const playlists = await resp.json();

		if (_.isEmpty(playlists)) {
			throw new Error('No Playlist Matching Name: ' + playlistName);
		}
		return { playlists: _.keyBy(playlists, 'id'), playlist: playlists[0] };
	};

	addSongToPlaylist = async ({ playlistId, userId, metaId }) => {
		const song: api.Songs = {
			playlist_id: playlistId,
			user_added: userId,
			metadata_id: metaId,
		};

		const resp = await api.SongsApiFp.songsPost({
			body: song,
		})(fetch, config.swaggerHost);

		return resp.ok;
	};

	getSongMetadata = async ({
		youtubeId,
		title,
		artist,
	}: {
		youtubeId?;
		title?;
		artist?;
	}): Promise<api.Metadata> => {
		const metadataParams: any = {};

		youtubeId && (metadataParams.youtubeId = `eq.${youtubeId}`);
		title && (metadataParams.title = `eq.${title}`);
		artist && (metadataParams.artist = `eq.${artist}`);

		const getMetadata = api.MetadataApiFp.metadataGet(metadataParams);
		const resp = await getMetadata(fetch, config.swaggerHost);
		return _.first(await resp.json()) as api.Metadata;
	};

	addSongMetadata = async ({ metadata }): Promise<api.Metadata> => {
		const addMeta = api.MetadataApiFp.metadataPost({
			body: metadata,
			prefer: 'return=representation',
		});
		const resp = await (await addMeta(fetch, config.swaggerHost)).json();
		return _.first(resp) as api.Metadata;
	};

	getAllUsers = async ({ limit = 5000 } = {}): Promise<any> => {
		const endpoint = `${config.swaggerHost}/users?limit=${limit}`;
		const users = await (await fetch(endpoint)).json();
		const normalized = normalize(users, [user]);

		return { ...normalized.entities };
	};

	getUser = async (optionalUsername, optionalPassword): Promise<any> => {
		const getU = api.UsersApiFp.usersGet({
			username: `eq.${optionalUsername}`,
		});
		const resp = await getU(fetch, config.swaggerHost);
		const users = await resp.json();

		if (_.isEmpty(user)) {
			throw new Error('No User Matching Description');
		}
		return { users: _.keyBy(users, 'id'), user: users[0] };
	};

	putUser = async (username, password): Promise<api.Users> => {
		if (username === '') {
			return Promise.reject('fuck you make a username');
		}

		const user: api.Users = { username, password: 'todo' };
		const resp = await api.UsersApiFp.usersPost({ body: user, prefer: 'return=representation' })(
			fetch,
			config.swaggerHost
		);

		return resp.json();
	};

	vote = async ({ userId, songId }: any) => {
		const voteReq = await api.VotesApiFp.votesPost({
			body: { song_id: songId, user_added: userId },
		})(fetch, config.swaggerHost);

		const voteResp = await voteReq.json();

		return { userId, songId, voteResp };
	};

	unvote = async ({ userId, songId }) => {
		const unvoteReq = await api.VotesApiFp.votesDelete({
			userAdded: `eq.${userId}`,
			songId: `eq.${songId}`,
		})(fetch, config.swaggerHost);

		const unvoteResp = await unvoteReq.json();

		return { userId, songId, unvoteResp };
	};

	deleteSong = async song => {
		const songId = song.id;
		// fk constraint on votes
		const deleteVotes = await api.VotesApiFp.votesDelete({ songId: `eq.${songId}` })(
			fetch,
			config.swaggerHost
		);
		const deleteSuccess = await deleteVotes;
		if (deleteSuccess.ok) {
			const deleteReq = await api.SongsApiFp.songsDelete({
				id: `eq.${song.id}`,
			})(fetch, config.swaggerHost);
			await deleteReq;
		}
		return { song };
	};

	searchYoutube = async ({ title, artist }) => {
		const endpoint =
			'https://www.googleapis.com/youtube/v3/search?type=video&maxResults=20&key=AIzaSyAPGx5PbhdoO2QTR16yZHgMj-Q2vqO8W1M&part=snippet';
		const searchTerm = encodeURIComponent(`${title} ${artist}`);
		const res = await fetch(`${endpoint}&q=${searchTerm}`);
		const json = await res.json();

		const first = json.items[0];
		return {
			youtube_id: first.id.videoId,
			youtube_title: first.snippet.title,
		};
	};

	getEvents = async ({ limit = 5000 }): Promise<Array<Event>> => {
		const endpoint = config.swaggerHost + `/events?limit=${limit}`;
		const events = await (await fetch(endpoint)).json();
		return events;
	};

	getYoutubeVideoDuration = async youtube_id => {
		const endpoint =
			'https://www.googleapis.com/youtube/v3/videos?part=contentDetails&key=AIzaSyAPGx5PbhdoO2QTR16yZHgMj-Q2vqO8W1M';
		const res = await fetch(`${endpoint}&id=${youtube_id}`);
		const json = await res.json();
		const youtube_duration = json.items[0].contentDetails.duration;
		return { youtube_duration };
	};

	searchForSongLastFm = async query => {
		const encodedQuery = encodeURIComponent(query);
		const endpoint = `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodedQuery}&format=json&api_key=39e1ebe26072b1ee0c6b4b9c1ca22889`;
		try {
			const res: any = await fetch(endpoint);
			const json = await res.json();
			return _.map(json.results.trackmatches.track, mapLastFmItemToBop);
		} catch (err) {
			console.error('fuck, lastfm search didnt work', err);
			return [];
		}
	};
	searchForSongMusicBrainz = async query => {
		const encodedQuery = encodeURIComponent(query);
		const endpoint = `http://musicbrainz.org/ws/2/recording/?fmt=json&dismax=true&query=${encodedQuery}`;
		try {
			const res: any = await fetch(endpoint);
			const json = await res.json();
			return _.map(json.recordings, mapMusicBrainzItemtoBop);
		} catch (err) {
			console.error('fuck, mb search didnt work', err);
			return [];
		}
	};
	// searchForSongMergedExperiment = async query => {
	// 	const [mbData, lastFmData] = await Promise.all([
	// 		this.searchForSongMusicBrainz(query),
	// 		this.searchForSongLastFm(query),
	// 	]);
	// 	console.error('mbdata: ', mbData, 'lastFmData', lastFmData);
	// 	const keyedMbData = _.mapKeys(
	// 		mbData,
	// 		(s: any) => s.artist.toUpperCase() + s.title.toUpperCase()
	// 	);
	// 	const keyedlastFmData = _.mapKeys(
	// 		lastFmData,
	// 		(s: any) => s.artist.toUpperCase() + s.title.toUpperCase()
	// 	);
	// 	const merged = _.merge({}, keyedMbData, keyedlastFmData);
	// 	const sorted = _.sortBy(_.values(merged), 'score');
	// 	return sorted;
	// };
	searchForSong = async query => {
		const trackSearch = await this.searchForSongLastFm(query);
		return trackSearch;
	};
}

window.api = api;

const sdk = new BopSdk();
window.sdk = sdk;
export default sdk;

export type ApiSongs = api.Songs;
export type ApiMetadata = api.Metadata;
export type ApiUser = api.Users;
export type ApiVotes = api.Votes;
export type ApiPlaylists = api.Playlists;
