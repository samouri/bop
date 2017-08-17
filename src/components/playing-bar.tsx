import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import * as cx from 'classnames';
import Player from 'react-player';
import * as Mousetrap from 'mousetrap';

import {
	getCurrentSong,
	getSongById,
	getNextSong,
	getPrevSong,
	getCurrentSort,
	getCurrentPlaylist,
} from '../state/reducer';
import { playSong, pauseSong, shuffleSongs } from '../state/actions';

type StateProps = {
	currentSong: any;
	nextSong: any;
	getSongById: any;
	sort: any;
	playlist: any;
	prevSong: any;
};

type Props = StateProps & { dispatch };

const YOUTUBE_PREFIX = 'https://www.youtube.com/watch?v=';

const opts = {
	playerVars: {
		// https://developers.google.com/youtube/player_parameters
		autoplay: 0,
		controls: 1,
		enablejsapi: 1,
		modestbranding: 1,
		playsinline: 1,
		iv_load_policy: 3, // don't show annotations by default
		autohide: 0,
	},
	preload: true,
};

class PlayingBar extends React.Component<Props> {
	componentDidMount() {
		Mousetrap.bind('space', this.handlePausePlay);
	}
	componentWillUnmount() {
		Mousetrap.unbind('space');
	}

	playNextSong = () => this.props.dispatch(playSong({ songId: this.props.nextSong }));
	playPrevSong = () => this.props.dispatch(playSong({ songId: this.props.prevSong }));
	handleOnPlay = () => this.props.dispatch(playSong({}));
	handleOnEnd = () => this.playNextSong();
	handleOnPause = () => this.props.dispatch(pauseSong());
	handlePausePlay = e => {
		e.preventDefault();

		// fixme: this is in case no currSong is null. it should really default to playqueue
		if (this.props.currentSong.song === null) {
			return this.playNextSong();
		}
		this.props.currentSong.playing
			? this.props.dispatch(pauseSong())
			: this.props.dispatch(playSong({}));
	};

	render() {
		const { currentSong, playlist } = this.props;
		const song = currentSong && currentSong.song;
		if (!currentSong || !song) {
			return null;
		}

		const shuffle = this.props.sort.shuffle;
		var playOrPauseClasses = cx('fa fa-2x pointer', {
			'fa-pause': currentSong.playing,
			'fa-play': !currentSong.playing,
		});

		return (
			<div className="playing-bar">
				<div className="playing-bar__width-wrapper">
					<div className="playing-bar__play-info">
						<img className="playing-bar__thumb" src={song.metadata.thumbnail_url} />
						<span className="playing-bar__arttit">
							<span className="playing-bar__title">
								{song.metadata.title}
							</span>
							<span className="playing-bar__artist">
								{song.metadata.artist}
							</span>
						</span>
					</div>
					<div className="playing-bar__play-controls">
						<i className="fa fa-2x fa-fast-backward pointer" onClick={this.playPrevSong} />
						<i className={playOrPauseClasses} onClick={this.handlePausePlay} />
						<i className="fa fa-2x fa-fast-forward pointer" onClick={this.playNextSong} />
						<i
							className={cx('fa fa-2x fa-random pointer', { active: shuffle })}
							onClick={() => this.props.dispatch(shuffleSongs({ playlistId: playlist.id }))}
						/>
					</div>
					<div className="playing-bar__player">
						<Player
							playing={currentSong && currentSong.playing}
							url={`${YOUTUBE_PREFIX}${this.props.currentSong.song &&
								this.props.currentSong.song.metadata.youtube_id}`}
							height={50}
							width={300}
							youtubeConfig={opts}
							onEnded={this.handleOnEnd}
							onPause={this.handleOnPause}
							onPlay={this.handleOnPlay}
						/>
					</div>
				</div>
			</div>
		);
	}
}

export default connect(state => ({
	getSongById: _.partial(getSongById, state),
	currentSong: getCurrentSong(state),
	nextSong: getNextSong(state),
	prevSong: getPrevSong(state),
	sort: getCurrentSort(state),
	playlist: getCurrentPlaylist(state),
}))(PlayingBar);
