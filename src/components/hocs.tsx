import * as React from 'react';
import { connect } from 'react-redux';
import * as _ from 'lodash';

import { playSong, pauseSong } from '../state/actions';
import { getCurrentUser, getCurrentPlayer, getDenormalizedSong } from '../state/reducer';
import sdk from '../sdk';

export const withSongControls = EnhancedComponent => {
	class WithSongControls extends React.Component<any> {
		state = { voteModifier: 0 };

		handleVote = () => {
			const { isUpvotedOnServer } = this.props;
			const vote = isUpvotedOnServer ? -1 : 1;
			const voteModifier = this.state.voteModifier !== 0 ? 0 : vote;

			this.setState({ voteModifier });

			const voteParams = { songId: this.props.song.id, userId: this.props.user.id };
			isUpvotedOnServer ? sdk.unvote(voteParams) : sdk.vote(voteParams);
		};

		handlePlay = () =>
			this.props.dispatch(playSong({ songId: this.props.songId, stream: this.props.stream }));
		handlePause = () => this.props.dispatch(pauseSong());

		render() {
			if (!this.props.song) {
				return null;
			}

			const isUpvoted =
				(this.props.isUpvotedOnServer && this.state.voteModifier !== -1) ||
				this.state.voteModifier === 1;

			return (
				<EnhancedComponent
					{...this.props}
					play={this.handlePlay}
					pause={this.handlePause}
					vote={this.handleVote}
					voteCount={this.props.song.votes.length + this.state.voteModifier}
					isUpvoted={isUpvoted}
				/>
			);
		}
	}

	const mapStateToProps = (state, ownProps) => {
		const song: any = getDenormalizedSong(state, { id: ownProps.songId });
		const player = getCurrentPlayer(state);
		const isSelected = song && player.songId === song.id;
		const isPlaying = isSelected && player.playing;
		const user: any = getCurrentUser(state);
		const isUpvotedOnServer = song && !!_.find(song.votes, { user_added: user.id });

		return { song, player, isSelected, isPlaying, isUpvotedOnServer, user };
	};

	return connect(mapStateToProps)(WithSongControls);
};

export const withPlayer = connect(state => ({ player: getCurrentPlayer(state) })) as any;
