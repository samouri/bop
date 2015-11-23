var React = require('react');
var cx = require('classnames');

var SongRow = React.createClass({
  getDefaultProps: function(){
    return {};
  },

  getInitialState: function() {
    return {
      "upvoted": this.props.upvoted,
      "starred": this.props.starred
    };
  },

  durationToString: function(duration) {
    var duration = this.props.duration;
    var duration_minutes = Math.floor(duration / 60);
    var duration_seconds = Math.floor(duration - duration_minutes * 60);
    return duration_minutes + ":" + duration_seconds;
  },

  getAge: function() {
    var dateAddedString = this.props.date_added;
    var dateAdded = new Date(dateAddedString);
    var age = (Date.now() - dateAdded.getTime()) / 1000;
    var age_minutes = Math.floor(age / 60);
    var age_hours = Math.floor(age_minutes / 60);

    if (age_hours < 1) {
      return age_minutes + "m";
    }
    return age_hours + "h";
  },

  getTitle: function() {
    var parensIndex = this.props.track.indexOf("(");
    if (parensIndex === -1) {
      return this.props.track.substring(0,23);
    }
    return this.props.track.substring(0, parensIndex).substring(0,23);
  },

  handleUpvote: function(song_info) {
    this.props.upvoteHandler(this.props);
    this.setState({upvoted: !this.state.upvoted});
  },

  handleStar: function(song_info) {
    this.props.starHandler(this.props);
    this.setState({starred: !this.state.starred});
  },

  render: function () {
    var playOrPauseClasses = cx('fa', 'fa-3x', 'pointer', {
      'fa-pause': this.props.playing && this.props.selected,
      'fa-play': !(this.props.playing && this.props.selected),
      'selected-purple': this.props.selected
    });

    var starred = this.state.starred || this.props.starred || false;
    console.log(starred);
    var starIconClasses = cx('fa fa-star fa-2x pointer', {
      'star-selected': starred
    });

    var upChevronClasses = cx('fa fa-chevron-up fa-2x pointer', {
      'up-chevron-selected': this.state.upvoted
    });

    var votes = this.props.votes;
    if (this.state.upvoted && !this.props.upvoted) {
      votes += 1;
    }
    else if (! this.state.upvoted && this.props.upvoted) {
      votes  -= 1;
    }


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
              <i className={playOrPauseClasses} onClick={this.props.clickPlayHandler(this.props.youtube_id, playOrPauseClasses)}></i>
              <span className="duration">{this.durationToString(this.props.duration)}</span>
            </div>
            <div className="vote-info pull-right col-xs-1">
                <i className={upChevronClasses} onClick={this.handleUpvote}></i>
                <span className="vote-count">{votes}</span>
                <i className={starIconClasses} onClick={this.handleStar}></i>
            </div>
        </div>
    );
  }
});

module.exports = SongRow;
