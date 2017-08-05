import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';
import * as cx from 'classnames';
import Player from 'react-player';

import { getCurrentSong, getSongById, getNextSong, getCurrentSort } from '../state/reducer';
import { playSong, pauseSong, shuffleSongs } from '../state/actions';
import { ApiSongData } from '../sdk';

type StateProps = {
	currentSong: any;
	nextSong: any;
	getSongById: any;
	sort: any;
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
	},
	preload: true,
};

class PlayingBar extends React.Component<Props> {
	handleOnPause = () => this.props.dispatch(pauseSong());
	handleOnPlay = () => this.props.dispatch(playSong({}));
	handleOnEnd = () => this.props.dispatch(playSong({ songId: this.props.nextSong }));

	render() {
		const { currentSong } = this.props;
		if (!currentSong) {
			return null;
		}

		const shuffle = this.props.sort.shuffle;
		var playOrPauseClasses = cx('fa fa-2x pointer', {
			'fa-pause': currentSong.playing,
			'fa-play': !currentSong.playing,
		});
		const handlePausePlay = currentSong.playing
			? () => this.props.dispatch(pauseSong())
			: () => this.props.dispatch(playSong({}));

		return (
			<div className="playing-bar">
				<div className="playing-bar__width-wrapper">
					<div className="playing-bar__play-controls">
						<i className="fa fa-2x fa-fast-backward pointer" />
						<i className={playOrPauseClasses} onClick={handlePausePlay} />
						<i className="fa fa-2x fa-fast-forward pointer" />
						<i
							className={cx('fa fa-2x fa-random pointer', { active: shuffle })}
							onClick={() => this.props.dispatch(shuffleSongs({}))}
						/>
					</div>
					<div className="playing-bar__player">
						<Player
							playing={currentSong && currentSong.playing}
							url={`${YOUTUBE_PREFIX}${this.props.currentSong &&
								this.props.getSongById(this.props.currentSong.songId).metadata.youtube_id}`}
							height={50}
							width={200}
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
	sort: getCurrentSort(state),
}))(PlayingBar);
