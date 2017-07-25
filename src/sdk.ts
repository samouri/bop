import config from './config';
import { isEmpty } from 'lodash';
import * as fetch from 'isomorphic-fetch';
import * as moment from 'moment';
window.moment = moment;

import * as api from './generated/api';

declare global {
	interface Window {
		swagger: any;
		moment: any;
		sdk: any;
		swaggerClient: any;
		api: any;
	}
}

export const mapSpotifyItemToBop = (song: any) => ({
	artist: song.artists[0].name,
	title: song.name,
	album: song.album.name,
	thumbnail_url: song.album.images[0].url,
	spotify_id: song.id,
	popularity: song.popularity,
});

export const mapLastFmItemToBop = (song: any) => ({
	artist: song.artist,
	title: song.name,
	album: song.album.name,
	thumbnail_url: song.image[3]['#text'],
});

export default class BopSdk {
	getSongsInPlaylist = async ({ playlistId, offset = 0, limit = 200 }) => {
		// hardcoded all playlist
		if (playlistId === 17) {
			return this.getSongsInAllPlaylist({ offset, limit });
		}

		const getSongs = api.SongsApiFp.songsGet({
			playlistId: `eq.${playlistId}`,
			offset: offset.toString(),
			limit: limit.toString(),
			select: '*,metadata{*},votes{*},user{id,username}',
		});
		const resp = await getSongs(fetch, config.swaggerHost);
		return resp.json();
	};

	//todo need better system
	getSongsInAllPlaylist = async ({ offset, limit }): Promise<api.Songs> => {
		const getSongs = api.SongsApiFp.songsGet({
			offset: offset.toString(),
			limit: limit.toString(),
			select: '*,metadata{*},votes{*},user{id,username}',
		});
		const resp = await getSongs(fetch, config.swaggerHost);
		return resp.json();
	};

	getSongsAddedByUser = async ({ userId, limit = 200, offset = 0 }) => {
		const getSongs = api.SongsApiFp.songsGet({
			id: `eq.${userId}`,
			offset: offset.toString(),
			limit: limit.toString(),
			select: '*,songs{*}',
		});
		const resp = await getSongs(fetch, config.swaggerHost);
		return resp.json();
	};

	createPlaylist = async ({ playlistName, userId }) => {
		const playlist: api.Playlists = { name: playlistName, userAdded: userId };
		const resp = await api.PlaylistsApiFp.playlistsPost({
			body: playlist,
		})(fetch, config.swaggerHost);

		return resp.json();
	};

	getPlaylistForName = async (playlistName: string): Promise<api.Playlists> => {
		const getPlaylists = api.PlaylistsApiFp.playlistsGet({
			name: `eq.${encodeURIComponent(playlistName)}`,
		});
		const resp = await getPlaylists(fetch, config.swaggerHost);
		const matches = await resp.json();

		if (isEmpty(matches)) {
			throw new Error('No Playlist Matching Name: ' + playlistName);
		}

		return matches[0];
	};

	addSongToPlaylist = async ({ playlistId, userId, metaId }) => {
		const song: api.Songs = {
			playlistId,
			userAdded: userId,
			metadataId: metaId,
		};

		const resp = await api.SongsApiFp.songsPost({
			body: song,
		})(fetch, config.swaggerHost);

		return resp.json();
	};

	getSongMetadata = async ({ youtubeId }): Promise<api.Metadata> => {
		const metadataParams: any = {};
		// spotifyId && (metadataParams.spotify_id = `eq.${encodeURIComponent(spotifyId)}`);
		youtubeId && (metadataParams.youtube_id = `eq.${encodeURIComponent(youtubeId)}`);
		const getMetadata = api.MetadataApiFp.metadataGet({
			youtubeId,
		});
		const resp = await getMetadata(fetch, config.swaggerHost);
		return resp.json();
	};
	addSongMetadata = async ({ lastFmMeta, youtubeMeta }): Promise<api.Metadata> => {
		const metadata: api.Metadata = {
			...lastFmMeta,
			...youtubeMeta,
		};
		const addMeta = api.MetadataApiFp.metadataPost({
			body: metadata,
			prefer: 'return=representation',
		});
		const resp = await addMeta(fetch, config.swaggerHost);
		return resp.json();
	};

	getUser = async (optionalUsername, optionalPassword): Promise<api.Users> => {
		const getU = api.UsersApiFp.usersGet({
			username: `eq.${optionalUsername}`,
		});
		const resp = await getU(fetch, config.swaggerHost);
		const matches = await resp.json();

		if (isEmpty(matches)) {
			throw new Error('No User Matching Description');
		}
		return matches[0];
	};

	putUser = async (username, password): Promise<api.Users> => {
		const user: api.Users = { username, password };
		const resp = await api.UsersApiFp.usersPost({ body: user, prefer: 'return=representation' })(
			fetch,
			config.swaggerHost
		);

		return resp.json();
	};

	vote = async ({ userId, songId }) => {
		const resp = await api.VotesApiFp.votesPost({
			body: { songId, userAdded: userId },
		})(fetch, config.swaggerHost);
		return resp.json();
	};

	unvote = async ({ userId, songId }) => {
		const resp = await api.VotesApiFp.votesDelete({
			userAdded: userId,
			songId,
		})(fetch, config.swaggerHost);
		return resp.json();
	};

	deleteSong = async songId => {
		const resp = await api.SongsApiFp.songsDelete({
			id: songId,
		})(fetch, config.swaggerHost);
		return resp.json();
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

	getYoutubeVideoDuration = async youtube_id => {
		const endpoint =
			'https://www.googleapis.com/youtube/v3/videos?part=contentDetails&key=AIzaSyAPGx5PbhdoO2QTR16yZHgMj-Q2vqO8W1M';
		const res = await fetch(`${endpoint}&id=${youtube_id}`);
		const json = await res.json();
		const youtube_duration = json.items[0].contentDetails.duration;
		return { youtube_duration };
	};

	searchForSong = async query => {
		const encodedQuery = encodeURIComponent(query);
		const endpoint = `http://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodedQuery}&format=json&api_key=39e1ebe26072b1ee0c6b4b9c1ca22889`;
		try {
			const res: any = await fetch(endpoint);
			return res.results.trackmatches.track.map(mapLastFmItemToBop);
		} catch (err) {
			console.error('fuck, search didnt work', err);
			return [];
		}
	};
}

window.api = api;
window.sdk = new BopSdk();
