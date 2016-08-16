import React from 'react';
import cx from 'classnames';

export default class SongRow extends React.Component {

  durationToString() {
    var duration = this.props.duration / 1000;
    var duration_minutes = Math.floor(duration / 60);
    var duration_seconds = Math.floor(duration - (duration_minutes * 60));
    if ( duration_seconds < 10 ) {
      duration_seconds = '0' + duration_seconds;
    }
    return duration_minutes + ":" + duration_seconds;
  }

  getAge() {
    var dateAddedString = this.props.creation_date;
    var dateAdded = new Date(dateAddedString);
    var age = (Date.now() - dateAdded.getTime()) / 1000;
    var age_minutes = Math.floor(age / 60);
    var age_hours = Math.floor(age_minutes / 60);

    if (age_hours < 1) {
      return age_minutes + "m";
    }
    return age_hours + "h";
  }

  getTitle() {
    return this.props.name;
  }

  handleUpvote = (song_info) => {
    this.props.onUpvote(this.props, this.props.upvoted? 0 : 1);
  }

  render() {
    var playOrPauseClasses = cx('fa', 'fa-3x', 'pointer', {
      'fa-pause': this.props.playing,
      'fa-play': ! this.props.playing,
      'selected-purple': this.props.selected
    });

    var upChevronClasses = cx('fa fa-chevron-up fa-2x pointer', {
      'up-chevron-selected': this.props.upvoted
    });

    let votes = this.props.upvotes;
		let handlePausePlay = (this.props.playing) ? this.props.onPause : this.props.onPlay;

    return (
        <div className="song-div row-eq-height">
            <div className="pull-left col-xs-offset-1 col-xs-2" id="img-div" >
              <img className="img-circle" src={this.props.thumbnail_url}></img>
            </div>
            <div className="song-info pull-left col-xs-6">
                <span className="song-title"> {this.getTitle()} </span>
                <span className="song-artist"> {this.props.artist} </span>
                <span className="time-since"> {this.getAge()} </span>
            </div>
            <div className="play-info pull-right col-xs-1">
              <i className={playOrPauseClasses} onClick={() => handlePausePlay(this.props.youtube_id)}></i>
              <span className="duration">{this.durationToString(this.props.duration)}</span>
            </div>
            <div className="vote-info pull-right col-xs-1">
                <i className={upChevronClasses} onClick={this.handleUpvote}></i>
                <span className="vote-count">{votes}</span>
            </div>
        </div>
    );
  }
}

