var React = require('react');
var cx = require('classnames');

// A Griddle Custom Row Component
var SongRow = React.createClass({
  getDefaultProps: function(){
    return { "data": {} };
  },

  durationToString: function(duration) {
    var duration = this.props.data.metadata.duration;
    var duration_minutes = Math.floor(duration / 60);
    var duration_seconds = duration - duration_minutes * 60;
    return duration_minutes + ":" + duration_seconds;
  },

  ageToString: function(age) {
    var age = this.props.data.age;
    var age_minutes = Math.floor(age / 60);
    return age_minutes + " minutes"
  },

  render: function () {
    var playOrPauseClasses = cx('fa', 'fa-3x', {
      'fa-pause': this.props.data.playing && this.props.data.selected,
      'fa-play': !(this.props.data.playing && this.props.data.selected),
      'selected-purple': this.props.data.selected
    });
    var upvotesClasses = cx('vote-count', {
      'padded-upvotes': ! this.props.data.threeDigitUpvotes
    });

    return (
        <div className="song-div row-eq-height">
            <div className="pull-left col-xs-offset-1 col-xs-2" id="img-div" >
              <img className="img-circle" src={this.props.data.metadata.thumbnail_url}></img>
            </div>
            <div className="song-info pull-left col-xs-4">
                <span className="song-title"> {this.props.data.metadata.track} </span>
                <span className="song-artist"> {this.props.data.metadata.artist} </span>
                <span className="time-since"> {this.ageToString(this.props.data.age)} </span>
            </div>
            <div className="play-info pull-right col-xs-1 col-xs-offset-2">
              <i className={playOrPauseClasses} onClick={this.props.data.clickPlayHandler(this.props.data.youtube_id, playOrPauseClasses)}></i>
              <span className="duration">{this.durationToString(this.props.data.metadata.duration)}</span>
            </div>
            <div className="vote-info pull-right col-xs-1">
                <i className="fa fa-chevron-up fa-2x"></i>
                <span className={upvotesClasses}>{this.props.data.upvotes}</span>
                <i className="fa fa-chevron-down fa-2x"></i>
            </div>
        </div>
    );
  }
});

module.exports = SongRow;
