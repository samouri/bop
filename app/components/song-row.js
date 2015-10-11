var React = require('react');
var cx = require('classnames');

var SongRow = React.createClass({
  getDefaultProps: function(){
    return { "data": {} };
  },

  getInitialState: function() {
    return { "upvoted": false };
  },

  durationToString: function(duration) {
    var duration = this.props.data.duration;
    var duration_minutes = Math.floor(duration / 60);
    var duration_seconds = Math.floor(duration - duration_minutes * 60);
    return duration_minutes + ":" + duration_seconds;
  },

  getAge: function() {
    var dateAddedString = this.props.data.date_added;
    var dateAdded = new Date(dateAddedString);
    var age = (Date.now() - dateAdded.getTime()) / 1000;
    var age_minutes = Math.floor(age / 60);
    var age_hours = Math.floor(age_minutes / 60);

    if (age_hours < 1) {
      return age_minutes + "m";
    }
    return age_hours + "h";
  },

  handleUpvote: function(song_info) {
    if (! this.state.upvoted) {
      this.props.data.upvoteHandler(this.props.data);
    }
    this.setState({upvoted: true});
  },

  render: function () {
    var playOrPauseClasses = cx('fa', 'fa-3x', 'pointer', {
      'fa-pause': this.props.data.playing && this.props.data.selected,
      'fa-play': !(this.props.data.playing && this.props.data.selected),
      'selected-purple': this.props.data.selected
    });

    var upChevronClasses = cx('fa fa-chevron-up fa-2x pointer', {
      'up-chevron-selected': this.state.upvoted
    });

    var votes = this.props.data.votes;
    if (this.state.upvoted) {
      votes += 1;
    }

    return (
        <div className="song-div row-eq-height">
            <div className="pull-left col-xs-offset-1 col-xs-2" id="img-div" >
              <img className="img-circle" src={this.props.data.thumbnail_url}></img>
            </div>
            <div className="song-info pull-left col-xs-4">
                <span className="song-title"> {this.props.data.track.substring(0,16)} </span>
                <span className="song-artist"> {this.props.data.artist} </span>
                <span className="time-since"> {this.getAge()} </span>
            </div>
            <div className="play-info pull-right col-xs-1 col-xs-offset-2">
              <i className={playOrPauseClasses} onClick={this.props.data.clickPlayHandler(this.props.data.youtube_id, playOrPauseClasses)}></i>
              <span className="duration">{this.durationToString(this.props.data.duration)}</span>
            </div>
            <div className="vote-info pull-right col-xs-1">
                <i className={upChevronClasses} onClick={this.handleUpvote}></i>
                <span className="vote-count">{votes}</span>
                <i className="fa fa-star fa-2x"></i>
            </div>
        </div>
    );
  }
});

module.exports = SongRow;
