import * as React from 'react';
import * as cx from 'classnames';
import * as _ from 'lodash';
import * as moment from 'moment';
import { connect } from 'react-redux';
import { getCurrentSong, getSongById, getUser } from '../state/reducer';

import { playSong, pauseSong, deleteSong } from '../state/actions';

class SongRow extends React.Component {
	state = {
		voteModifier: 0,
	};

	durationToString() {
		var duration = moment.duration(this.props.song.metadata.youtube_duration);
		var duration_minutes = duration.minutes();
		var duration_seconds = duration.seconds();
		if (duration_seconds < 10) {
			duration_seconds = '0' + duration_seconds;
		}
		return duration_minutes + ':' + duration_seconds;
	}

	getAge = () => moment.utc(this.props.song.date_added).fromNow();

	handleUpvote = () => {
		const { isUpvoted } = this.props;
		const sdk = window.sdk;
		const vote = isUpvoted ? -1 : 1;
		const voteModifier = this.state.voteModifier !== 0 ? 0 : vote;

		this.setState({ voteModifier });
		const voteRequest = isUpvoted ? sdk.unvote : sdk.vote;
		voteRequest({ songId: this.props.song.id, userId: this.props.user.id }).catch(error => {
			console.error(error, error.stack);
		});
	};

	handleDelete = () => {
		this.props.dispatch(deleteSong(this.props.song));
	};

	render() {
		const { title, artist, thumbnail_url } = this.props.song.metadata;
		const { id: songId, votes } = this.props.song;
		var playOrPauseClasses = cx('fa', 'fa-3x', 'pointer', {
			'fa-pause': this.props.isPlaying,
			'fa-play': !this.props.isPlaying,
			'selected-purple': this.props.isSelected,
		});

		var upChevronClasses = cx('fa fa-chevron-up fa-2x pointer', {
			'up-chevron-selected':
				(this.props.isUpvoted && this.state.voteModifier !== -1) || this.state.voteModifier === 1,
		});

		let handlePausePlay = this.props.isPlaying
			? () => this.props.dispatch(pauseSong(songId))
			: () => this.props.dispatch(playSong(songId));

		return (
			<div className="song-div row-eq-height">
				<div className={'col-xs-1'}>
					{(!this.props.song.added_by || this.props.song.added_by === this.props.user.username) &&
						<div
							onClick={this.handleDelete}
							style={{ cursor: 'pointer', paddingTop: '35px', color: 'red' }}
						>
							{' '}X{' '}
						</div>}
				</div>
				<div className="pull-left col-xs-2" id="img-div">
					<img alt="artist thumbnail" className="img-circle" src={thumbnail_url} />
				</div>
				<div className="song-info pull-left col-xs-6">
					<span className="song-title">
						{title}
					</span>
					<span className="song-artist">
						{artist}
					</span>
					<span className="posted-info">
						posted {this.getAge()} by {this.props.song.user.username}
					</span>
				</div>
				<div className="play-info pull-right col-xs-1">
					<i className={playOrPauseClasses} onClick={handlePausePlay} />
					<span className="duration">
						{this.durationToString(this.props.song.duration)}
					</span>
				</div>
				<div className="vote-info pull-right col-xs-1">
					<i className={upChevronClasses} onClick={this.handleUpvote} />
					<span className="vote-count">
						{votes.length + this.state.voteModifier}
					</span>
				</div>
			</div>
		);
	}
}

function mapStateToProps(state, ownProps) {
	const song = getSongById(state, ownProps.songId);
	const currentSong = getCurrentSong(state);
	const isSelected = currentSong && currentSong.songId === song.id;
	const isPlaying = isSelected && currentSong.playing;
	const user = getUser(state);

	return {
		song,
		isSelected,
		isPlaying,
		isUpvoted: !!_.find(song.votes, { user_added: user.id }),
		user,
	};
}

export default connect(mapStateToProps)(SongRow);
