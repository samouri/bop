import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { connect } from 'react-redux';
import {
	getCurrentSong,
	getSongById,
	getUpvotedSongs
} from '../app/reducer';

import {
	playSong,
	pauseSong,
	voteSong,
} from '../app/actions';

class SongRow extends React.Component {

	state = {
		voteModifier: 0,
	};

  durationToString() {
    var duration = this.props.song.duration / 1000;
    var duration_minutes = Math.floor( duration / 60 );
    var duration_seconds = Math.floor( duration - ( duration_minutes * 60 ) );
    if ( duration_seconds < 10 ) {
      duration_seconds = '0' + duration_seconds;
    }
    return duration_minutes + ":" + duration_seconds;
  }

  getAge() {
    var dateAddedString = this.props.song.creation_date;
    var dateAdded = new Date( dateAddedString );
    var age = ( Date.now() - dateAdded.getTime() ) / 1000;
    var age_minutes = Math.floor( age / 60 );
    var age_hours = Math.floor( age_minutes / 60 );

    if ( age_hours < 1 ) {
      return age_minutes + "m";
    }
    return age_hours + "h";
  }

  getTitle() {
    return this.props.song.name;
  }

  handleUpvote = () => {
		const { sdk, song: { playlist_id, youtube_id } } = this.props;
		const vote = this.props.isUpvoted ? -1 : 1;
		const voteModifier = this.state.voteModifier !== 0 ? 0 : vote;
		const prevModifier = this.state.voteModifier;

		this.setState({ voteModifier });
		sdk.vote( playlist_id, youtube_id )
			.catch( error => {
				console.error( error, error.stack );
				this.setState({ voteModifier: prevModifier });
			} );
  }

  render() {
    var playOrPauseClasses = cx('fa', 'fa-3x', 'pointer', {
      'fa-pause': this.props.isPlaying,
      'fa-play': ! this.props.isPlaying,
      'selected-purple': this.props.isSelected,
    });

    var upChevronClasses = cx('fa fa-chevron-up fa-2x pointer', {
      'up-chevron-selected': ( this.props.isUpvoted && this.state.voteModifier !== -1 )
				|| ( this.state.voteModifier === 1 )
    });

    let votes = this.props.song.upvotes;
		let handlePausePlay = ( this.props.isPlaying )
			? () => this.props.dispatch( pauseSong( this.props.song._id ) )
			: () => this.props.dispatch( playSong( this.props.song._id ) )

    return (
        <div className="song-div row-eq-height">
            <div className="pull-left col-xs-offset-1 col-xs-2" id="img-div" >
              <img className="img-circle" src={ this.props.song.thumbnail_url }></img>
            </div>
            <div className="song-info pull-left col-xs-6">
                <span className="song-title">{ this.getTitle() }</span>
                <span className="song-artist">{ this.props.song.artist }</span>
                <span className="time-since">{ this.getAge() }</span>
            </div>
            <div className="play-info pull-right col-xs-1">
              <i className={ playOrPauseClasses } onClick={ handlePausePlay }></i>
              <span className="duration">{ this.durationToString( this.props.song.duration ) }</span>
            </div>
            <div className="vote-info pull-right col-xs-1">
                <i className={ upChevronClasses } onClick={ this.handleUpvote }></i>
                <span className="vote-count">{ votes + this.state.voteModifier }</span>
            </div>
        </div>
    );
  }
}

function mapStateToProps( state, ownProps ) {
	const song = getSongById( state, ownProps.songId );
	const currentSong = getCurrentSong( state );
	const isSelected = currentSong && currentSong.songId === song._id;
	const isPlaying = isSelected && currentSong.playing;

	return {
		song,
		isSelected,
		isPlaying,
		isUpvoted: _.has( getUpvotedSongs( state ), song._id ),
	}
}

export default connect( mapStateToProps )( SongRow );
