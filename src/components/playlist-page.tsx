import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';

import SearchBar from './searchbar';
import TopContributors from './top-contributors';
import SongList from './song-list';
import sdk, { ApiUser, ApiPlaylists } from '../sdk';

import { fetchSongsInPlaylist, setSort, setPlaylistName, SORT } from '../state/actions';
import { getCurrentUser, getCurrentPlaylist } from '../state/reducer';

type Props = {
	match: { params: any };
	dispatch: any;
	playlist: ApiPlaylists & { user: any };
	user: ApiUser;
};
class PlaylistPage extends React.Component<Props> {
	fetchSongs = _.throttle(
		(props = this.props) => props.dispatch(fetchSongsInPlaylist({ playlistId: props.playlist.id })),
		200
	);

	componentWillMount() {
		const { match: { params }, dispatch } = this.props;
		if (params.playlistName) {
			dispatch(setPlaylistName(params.playlistName));
		}
	}
	componentWillReceiveProps(nextProps) {
		const { match: { params }, dispatch } = nextProps;

		if (nextProps.playlistName && !nextProps.playlist) {
			dispatch(setPlaylistName(params.playlistName));
		}
	}

	handleSearchSelection = async ({ title, artist, thumbnail_url }) => {
		const { playlist, user } = this.props;

		const youtubeSearchMeta = await sdk.searchYoutube({ title, artist });
		let songMeta = await sdk.getSongMetadata({ youtubeId: youtubeSearchMeta.youtube_id });

		// if we don't have the meta for it yet, create it
		if (!songMeta) {
			const youtubeDuration = await sdk.getYoutubeVideoDuration(youtubeSearchMeta.youtube_id);
			const youtubeMeta = { ...youtubeSearchMeta, ...youtubeDuration };
			songMeta = await sdk.addSongMetadata({
				metadata: { title, artist, thumbnail_url, ...youtubeDuration, ...youtubeMeta },
			});
		}

		console.error(songMeta, user, playlist);
		sdk
			.addSongToPlaylist({ userId: user.id, playlistId: playlist.id, metaId: songMeta.id })
			.then(() => this.fetchSongs())
			.catch(err => {
				console.error('seems like we couldnt add a song', err, err.stack);
			});
	};
	throttledSearchSelection = _.throttle(this.handleSearchSelection, 100);

	setSortHandler = (sort: SORT) => () => {
		this.props.dispatch(setSort({ sort }));
	};

	render() {
		const { playlist } = this.props;
		const ret = (
			<div>
				<div className="playlist-page__titlestats">
					<span className="playlist-page__title">
						<span>
							{playlist && playlist.name}
						</span>
						{playlist &&
							<span className="playlist-page__title-createdby">
								created by @{playlist && playlist.user && playlist.user.username}
							</span>}
					</span>
					<div className="playlist-page__top-contribs">
						<TopContributors />
					</div>
				</div>

				<div className="playlist-page__search-bar">
					<i className="fa fa-search" />
					<div style={{ display: 'block' }}>
						<SearchBar handleSelection={this.throttledSearchSelection} />
					</div>
				</div>
				<div style={{ paddingBottom: '80px' }}>
					<SongList stream={{ type: 'playlist', id: playlist.id }} />
				</div>
			</div>
		);
		return ret;
	}
}

export default connect<{}, {}, Props>(state => {
	return {
		user: getCurrentUser(state),
		playlist: getCurrentPlaylist(state),
	};
})(PlaylistPage);
