import Swagger from 'swagger-client';
import config from './config';
import { isEmpty } from 'lodash';
import 'whatwg-fetch';
import moment from 'moment';
window.swagger = Swagger;
window.moment = moment;

export const mapSpotifyItemToBop = song => ({
	artist: song.artists[0].name,
	title: song.name,
	album: song.album.name,
	thumbnail_url: song.album.images[0].url,
	spotify_id: song.id,
	popularity: song.popularity,
});

export default function BopSdk() {
	this.loaded = false;

	this.getSongsInPlaylist = async ({ playlistId, offset = 0, limit = 200 }) => {
		// hardcoded all playlist
		if (playlistId === 17) {
			return this.getSongsInAllPlaylist({ offset, limit });
		}

		const matches = this.client.songs.get_songs({
			playlist_id: `eq.${playlistId}`,
			offset,
			limit,
			select: '*,metadata{*},votes{*}',
		});
		return (await matches).obj;
	};

	//todo need better system
	this.getSongsInAllPlaylist = async ({ offset, limit }) => {
		const matches = this.client.songs.get_songs({
			offset,
			limit,
			select: '*,metadata{*},votes{*}',
		});
		return (await matches).obj;
	};

	this.createPlaylist = async ({ playlistName, userId }) =>
		this.client.playlists.post_playlists({ body: { name: playlistName, user_added: userId } });

	this.getPlaylistForName = async playlistName => {
		const matches = (await this.client.playlists.get_playlists({
			name: `eq.${encodeURIComponent(playlistName)}`,
		})).obj;
		if (isEmpty(matches)) {
			throw new Error('No Playlist Matching Name: ' + playlistName);
		}
		return matches[0];
	};

	this.addSongToPlaylist = async ({ playlistId, userId, metaId }) =>
		this.client.songs.post_songs({
			body: { playlist_id: playlistId, user_added: userId, metadata_id: metaId },
		});

	this.getSongMetadata = async ({ spotifyId, youtubeId }) => {
		const metadataParams = {};
		spotifyId && (metadataParams.spotify_id = `eq.${encodeURIComponent(spotifyId)}`);
		youtubeId && (metadataParams.youtube_id = `eq.${encodeURIComponent(youtubeId)}`);
		const res = await this.client.metadata.get_metadata(metadataParams);
		return res.obj.length > 0 && res.obj[0];
	};
	this.addSongMetadata = async ({ spotifyMeta, youtubeMeta }) => {
		const res = await this.client.metadata.post_metadata({
			body: { ...spotifyMeta, ...youtubeMeta },
			Prefer: 'return=representation',
		});
		return res.obj[0];
	};

	this.getUser = async (optionalUsername, optionalPassword) => {
		const matches = (await this.client.users.get_users({ username: `eq.${optionalUsername}` })).obj;
		if (isEmpty(matches)) {
			throw new Error('No User Matching Description');
		}
		return matches[0];
	};

	this.putUser = async (username, password) =>
		this.client.apis.users.post_users({ body: { username, password: 'todo' } });

	this.vote = async ({ userId, songId }) =>
		this.client.votes.post_votes({ body: { song_id: songId, user_added: userId } });

	this.unvote = async ({ userId, songId }) =>
		this.client.votes.delete_votes({ song_id: `eq.${songId}`, user_added: `eq.${userId}` });

	this.deleteSong = async songId => this.client.songs.delete_songs({ id: `eq.${songId}` });

	this.searchYoutube = async ({ title, artist }) => {
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

	this.getYoutubeVideoDuration = async youtube_id => {
		const endpoint =
			'https://www.googleapis.com/youtube/v3/videos?part=contentDetails&key=AIzaSyAPGx5PbhdoO2QTR16yZHgMj-Q2vqO8W1M';
		const res = await fetch(`${endpoint}&id=${youtube_id}`);
		const json = await res.json();
		const youtube_duration = json.items[0].contentDetails.duration;
		return { youtube_duration };
	};

	this.searchForSong = async query => {
		const encodedQuery = encodeURIComponent(query);
		const endpoint = `https://api.spotify.com/v1/search?type=track&q=${encodedQuery}`;
		try {
			const res = await fetch(endpoint);
			return res.items.map(mapSpotifyItemToBop);
		} catch (err) {
			console.error('fuck, search didnt work', err);
			return [];
		}
	};

	return new Swagger({ url: config.swaggerUrl, usePromise: true })
		.then(client => {
			this.client = client;
			window.swaggerClient = this.client;
			if (config.swaggerHost) {
				client.setHost(config.swaggerHost);
			}
			return this;
		})
		.catch(error => console.error('could not load the sdk, what to do, what to do'));
}
