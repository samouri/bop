import * as _ from 'lodash';
import * as React from 'react';
import { connect } from 'react-redux';
import Player from 'react-player';
import * as cx from 'classnames';

import Header from './header';
import SearchBar from './searchbar';
import FTUEHero from './ftueBanner';
import SongRow from './song-row';

import BopSdk from '../sdk';
import {
	fetchSongs,
	loginUser,
	playSong,
	pauseSong,
	setSort,
	shuffleSongs,
	requestPlaylist,
	setPlaylistName,
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

let sdk: any;

const YOUTUBE_PREFIX = 'https://www.youtube.com/watch?v=';
const TOP = 'top';
const NEW = 'new';

const opts = {
	playerVars: {
		// https://developers.google.com/youtube/player_parameters
		autoplay: 0,
		controls: 1,
		enablejsapi: 1,
		modestbranding: 1,
		playsinline: 1,
	},
	preload: true,
};

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
	showFTUEHero: boolean;
};
class PlaylistPage extends React.Component<Props> {
	player: any = false;
	state = {
		selectedVideoId: null,
		songs: [],
		page: 0,
		sort: TOP,
		upvotes: {},
		userInfo: {},
		sdk: null,
	};

	componentWillMount() {
		const { match: { params }, dispatch } = this.props;
		if (params.playlistName) {
			dispatch(setPlaylistName(params.playlistName));
		}
	}
	fetchSongs = _.throttle(
		(props = this.props) => props.dispatch(fetchSongs(props.playlist.id)),
		200
	);
	componentWillReceiveProps(nextProps) {
		if (_.isEmpty(nextProps.songs) && nextProps.playlist) {
			this.fetchSongs(nextProps);
		}
	}

	async componentDidMount() {
		sdk = window.sdk = await new BopSdk();
		this.props.dispatch(requestPlaylist(this.props.currentPlaylistName));

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

	handleOnPause = () => {
		this.props.dispatch(pauseSong(this.props.currentSong.songId));
	};

	handleOnEnd = () => {
		// play next song
		this.props.dispatch(playSong(this.props.nextSong));
	};

	handleSearchSelection = async ({ title, artist, thumbnail_url }) => {
		const { playlist, user } = this.props;
		console.error(title, artist);
		let songMeta = await sdk.getSongMetadata({ title, artist });
		// if we don't have the meta for it yet, create it
		if (!songMeta) {
			const youtubeMeta = await sdk.searchYoutube({ title, artist });
			const youtubeDuration = await sdk.getYoutubeVideoDuration(youtubeMeta.youtube_id);
			youtubeMeta.youtube_duration = youtubeDuration.youtube_duration;
			songMeta = await sdk.addSongMetadata({
				metadata: { ...songMeta, title, artist, thumbnail_url, ...youtubeDuration, ...youtubeMeta },
			});
		}

		sdk
			.addSongToPlaylist({ userId: user.id, playlistId: playlist.id, metaId: songMeta.id })
			.then(() => this.fetchSongs())
			.catch(err => {
				console.error('seems like we couldnt add a song', err, err.stack);
			});
	};
	throttledSearchSelection = _.throttle(this.handleSearchSelection, 100);

	handleOnPlay = (songId?) => {
		this.props.dispatch(playSong(this.props.currentSong.songId));
	};

	handleRegister = login => {
		console.log('attempting to create user');
		sdk.putUser(login.username, login.password).then(resp => {
			this.props.dispatch(loginUser(login));
		});
	};

	renderSongsList = () => {
		if (_.isEmpty(this.props.songs)) {
			return <p> Theres a first for everything </p>;
		} else {
			return _.map(this.props.songs, (song: any) =>
				<li className="list-group-item" key={`song-${song.id}`}>
					<SongRow songId={song.id} />
				</li>
			);
		}
	};

	render() {
		const { playlist } = this.props;
		const sort = this.props.sort.sort;
		const shuffle = this.props.sort.shuffle;
		var hotBtnClasses = cx('filter-btn', 'pointer', { active: sort === TOP });
		var newBtnClasses = cx('filter-btn', 'pointer', { active: sort === NEW });
		var shuffleBtnClasses = cx('pointer', 'fa', 'fa-random', { active: shuffle });

		const ret = (
			<div className="row">
				<div className="row">
					<Header
						onLogin={(login: any) => this.props.dispatch(loginUser(login))}
						onRegister={this.handleRegister}
					/>
				</div>

				{this.props.showFTUEHero && <FTUEHero />}

				<div className={this.props.showFTUEHero ? 'hidden' : 'row'}>
					<Player
						playing={this.props.currentSong && this.props.currentSong.playing}
						url={`${YOUTUBE_PREFIX}${this.props.currentSong &&
							this.props.getSongById(this.props.currentSong.songId).metadata.youtube_id}`}
						width={828}
						youtubeConfig={opts}
						onEnded={this.handleOnEnd}
						onPause={this.handleOnPause}
						onPlay={this.handleOnPlay}
					/>
				</div>
				<div className={'row'} id={'gradient_bar'}>
					<div className="col-xs-offset-4 cols-xs-1">
						<i
							className={shuffleBtnClasses}
							onClick={() => this.props.dispatch(shuffleSongs(playlist.id))}
						/>
					</div>
					<div className="btn-group col-xs-3" role="group">
						<div className={hotBtnClasses} onClick={() => this.props.dispatch(setSort(TOP))}>
							Hot
						</div>
						<div className={newBtnClasses} onClick={() => this.props.dispatch(setSort(NEW))}>
							New
						</div>
					</div>
					<div className="col-xs-4 col-xs-offset-1">
						<SearchBar handleSelection={this.throttledSearchSelection} />
					</div>
				</div>
				<div className="row">
					<ul className="list-group">
						{this.renderSongsList()}
					</ul>
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
		showFTUEHero: getCurrentSong(state) === null,
		getSongById: _.partial(getSongById, state),
		sort: getCurrentSort(state),
		nextSong: getNextSong(state),
	};
}

export default connect<{}, {}, Props>(mapStateToProps)(PlaylistPage);
