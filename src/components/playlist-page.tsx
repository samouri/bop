import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import * as cx from 'classnames';

import Header from './header';
import SearchBar from './searchbar';
import SongRow from './song-row';
import TopContributors from './top-contributors';
import sdk from '../sdk';

import {
	fetchSongs,
	loginUser,
	playSong,
	pauseSong,
	setSort,
	shuffleSongs,
	requestPlaylist,
	setPlaylistName,
	SORT,
} from '../state/actions';
import {
	getCurrentSort,
	getCurrentPlaylistName,
	getUpvotedSongs,
	getUsername,
	getCurrentSong,
	getSongById,
	getSortedSongs,
	getNextSong,
	getUser,
	getCurrentPlaylist,
} from '../state/reducer';

type Props = {
	match: { params: any };
	dispatch: any;
	playlist: any;
	nextSong: any;
	songs: any;
	currentPlaylistName: any;
	player: any;
	currentSong: any;
	getSongById: any;
	user: any;
	sort: any;
};
class PlaylistPage extends React.Component<Props> {
	player: any = false;
	state = {
		selectedVideoId: null,
		songs: [],
		page: 0,
		upvotes: {},
		userInfo: {},
	};

	fetchSongs = _.throttle(
		(props = this.props) => props.dispatch(fetchSongs({ playlistId: props.playlist.id })),
		200
	);

	componentWillMount() {
		const { match: { params }, dispatch } = this.props;
		if (params.playlistName) {
			dispatch(setPlaylistName({ playlistName: params.playlistName }));
		}
	}
	componentWillReceiveProps(nextProps) {
		const { match: { params }, dispatch } = nextProps;

		if (
			nextProps.songs === null &&
			nextProps.playlist &&
			nextProps.playlist !== this.props.playlist
		) {
			this.fetchSongs(nextProps);
		}

		if (params.playlistName) {
			dispatch(setPlaylistName({ playlistName: params.playlistName }));
		} else if (_.isEmpty(params)) {
			dispatch(setPlaylistName({ playlistName: 'All' }));
		}

		if (nextProps.currentPlaylistName && !nextProps.playlist) {
			dispatch(
				requestPlaylist({
					playlistName: nextProps.currentPlaylistName,
					userId: nextProps.user.id,
				})
			);
		}
	}

	async componentDidMount() {
		this.props.dispatch(
			requestPlaylist({ playlistName: this.props.currentPlaylistName, userId: this.props.user.id })
		);

		try {
			let login = localStorage.getItem('login');
			if (login) {
				login = JSON.parse(login);
				this.props.dispatch(loginUser(login));
			}
		} catch (err) {
			console.error(err, err.stack);
		}
	}

	handleSearchSelection = async ({ title, artist, thumbnail_url }) => {
		const { playlist, user } = this.props;
		console.error(title, artist);
		let songMeta = await sdk.getSongMetadata({ title, artist });
		// if we don't have the meta for it yet, create it
		if (!songMeta) {
			const youtubeSearchMeta = await sdk.searchYoutube({ title, artist });
			const youtubeDuration = await sdk.getYoutubeVideoDuration(youtubeSearchMeta.youtube_id);
			const youtubeMeta = { ...youtubeSearchMeta, ...youtubeDuration };
			songMeta = await sdk.addSongMetadata({
				metadata: { title, artist, thumbnail_url, ...youtubeDuration, ...youtubeMeta },
			});
		}

		console.error(user, playlist, songMeta);
		sdk
			.addSongToPlaylist({ userId: user.id, playlistId: playlist.id, metaId: songMeta.id })
			.then(() => this.fetchSongs())
			.catch(err => {
				console.error('seems like we couldnt add a song', err, err.stack);
			});
	};
	throttledSearchSelection = _.throttle(this.handleSearchSelection, 100);

	handleRegister = login => {
		console.log('attempting to create user');
		sdk.putUser(login.username, login.password).then(resp => {
			this.props.dispatch(loginUser(login));
		});
	};

	renderSongsList = () => {
		const { songs } = this.props;
		if (_.isEmpty(songs)) {
			return <p> Theres a first for everything </p>;
		} else {
			return _.map(songs, (song: any) => <SongRow key={song.id} songId={song.id} />);
		}
	};

	setSortHandler = (sort: SORT) => () => {
		this.props.dispatch(setSort({ sort }));
	};

	render() {
		const { playlist, currentSong, dispatch } = this.props;
		const sort = this.props.sort.sort;

		const ret = (
			<div>
				<Header
					onLogin={(login: any) => this.props.dispatch(loginUser(login))}
					onRegister={this.handleRegister}
				/>
				<div className="playlist-page__titlestats">
					<span className="playlist-page__title">
						<span>
							{this.props.currentPlaylistName}{' '}
						</span>
						{this.props.playlist &&
							<span className="playlist-page__title-createdby">
								created by @{this.props.playlist.users.username}
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
				<div className="">
					<div className="header-row">
						<span className="play-info" />
						<span
							className={cx('pointer vote-info', { active: sort === 'votes' })}
							onClick={this.setSortHandler('votes')}
						>
							VOTES
						</span>
						<span
							className={cx('song-title, pointer', { active: sort === 'title' })}
							onClick={this.setSortHandler('title')}
						>
							TITLE
						</span>
						<span
							className={cx('song-artist, pointer', { active: sort === 'artist' })}
							onClick={this.setSortHandler('artist')}
						>
							ARIST
						</span>
						<span
							className={cx('song-artist, pointer', { active: sort === 'playlist' })}
							onClick={this.setSortHandler('playlist')}
						>
							PLAYLIST
						</span>
						<span
							className={cx('song-date, pointer', { active: sort === 'date' })}
							onClick={this.setSortHandler('date')}
						>
							POSTED
						</span>
						<span
							className={cx('song-postee, pointer', { active: sort === 'user' })}
							onClick={this.setSortHandler('user')}
						>
							USER
						</span>
						<span
							className={cx('song-duration, pointer', { active: sort === 'duration' })}
							onClick={this.setSortHandler('duration')}
						>
							<i className="fa fa-lg fa-clock-o" />
						</span>
					</div>

					{this.renderSongsList()}
				</div>
			</div>
		);
		return ret;
	}
}

function mapStateToProps(state) {
	return {
		songs: getSortedSongs(state),
		user: getUser(state),
		username: getUsername(state),
		upvotedSongs: getUpvotedSongs(state),
		currentSong: getCurrentSong(state),
		currentPlaylistName: getCurrentPlaylistName(state),
		playlist: getCurrentPlaylist(state),
		getSongById: _.partial(getSongById, state),
		sort: getCurrentSort(state),
		nextSong: getNextSong(state),
	};
}

export default connect<{}, {}, Props>(mapStateToProps)(PlaylistPage);
