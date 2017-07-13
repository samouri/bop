import * as Swagger from 'swagger-client';
import config from './config';
import { isEmpty } from 'lodash';
import 'whatwg-fetch';
import * as moment from 'moment';
window.swagger = Swagger;
window.moment = moment;

declare global {
	interface Window {
		swagger: any;
		moment: any;
		sdk: any;
		swaggerClient: any;
	}
}

export const mapSpotifyItemToBop = song => ({
	artist: song.artists[0].name,
	title: song.name,
	album: song.album.name,
	thumbnail_url: song.album.images[0].url,
	spotify_id: song.id,
	popularity: song.popularity,
});

export default class BopSdk {
	loaded = false;
	client: any = false;
	constructor() {
		new Swagger({ url: config.swaggerUrl, usePromise: true })
			.then(c => {
				this.client = window.swaggerClient = c;
				if (config.swaggerHost) {
					this.client.setHost(config.swaggerHost);
				}
				return this;
			})
			.catch(error => console.error('could not load the sdk, what to do, what to do'));
	}

	getSongsInPlaylist = async ({ playlistId, offset = 0, limit = 200 }) => {
		// hardcoded all playlist
		if (playlistId === 17) {
			return this.getSongsInAllPlaylist({ offset, limit });
		}

		const matches = this.client.songs.get_songs({
			playlist_id: `eq.${playlistId}`,
			offset,
			limit,
			select: '*,metadata{*},votes{*},user{id,username}',
		});
		return (await matches).obj;
	};

	//todo need better system
	getSongsInAllPlaylist = async ({ offset, limit }) => {
		const matches = this.client.songs.get_songs({
			offset,
			limit,
			select: '*,metadata{*},votes{*},user{id,username}',
		});
		return (await matches).obj;
	};

	getSongsAddedByUser = async ({ userId, limit = 200, offset = 0 }) => {
		const matches = this.client.users.get_users({
			id: `eq.${userId}`,
			offset,
			limit,
			select: '*,songs{*}',
		});
		return (await matches).obj;
	};

	createPlaylist = async ({ playlistName, userId }) =>
		this.client.playlists.post_playlists({ body: { name: playlistName, user_added: userId } });

	getPlaylistForName = async playlistName => {
		const matches = (await this.client.playlists.get_playlists({
			name: `eq.${encodeURIComponent(playlistName)}`,
		})).obj;
		if (isEmpty(matches)) {
			throw new Error('No Playlist Matching Name: ' + playlistName);
		}
		return matches[0];
	};

	addSongToPlaylist = async ({ playlistId, userId, metaId }) =>
		this.client.songs.post_songs({
			body: { playlist_id: playlistId, user_added: userId, metadata_id: metaId },
		});

	getSongMetadata = async ({ spotifyId, youtubeId }) => {
		const metadataParams: any = {};
		spotifyId && (metadataParams.spotify_id = `eq.${encodeURIComponent(spotifyId)}`);
		youtubeId && (metadataParams.youtube_id = `eq.${encodeURIComponent(youtubeId)}`);
		const res = await this.client.metadata.get_metadata(metadataParams);
		return res.obj.length > 0 && res.obj[0];
	};
	addSongMetadata = async ({ spotifyMeta, youtubeMeta }) => {
		const res = await this.client.metadata.post_metadata({
			body: { ...spotifyMeta, ...youtubeMeta },
			Prefer: 'return=representation',
		});
		return res.obj[0];
	};

	getUser = async (optionalUsername, optionalPassword) => {
		const matches = (await this.client.users.get_users({ username: `eq.${optionalUsername}` })).obj;
		if (isEmpty(matches)) {
			throw new Error('No User Matching Description');
		}
		return matches[0];
	};

	putUser = async (username, password) =>
		this.client.apis.users.post_users({ body: { username, password: 'todo' } });

	vote = async ({ userId, songId }) =>
		this.client.votes.post_votes({ body: { song_id: songId, user_added: userId } });

	unvote = async ({ userId, songId }) =>
		this.client.votes.delete_votes({ song_id: `eq.${songId}`, user_added: `eq.${userId}` });

	deleteSong = async songId => this.client.songs.delete_songs({ id: `eq.${songId}` });

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
		const endpoint = `https://api.spotify.com/v1/search?type=track&q=${encodedQuery}`;
		try {
			const res: any = await fetch(endpoint);
			return res.items.map(mapSpotifyItemToBop);
		} catch (err) {
			console.error('fuck, search didnt work', err);
			return [];
		}
	};
}
