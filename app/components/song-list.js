var React = require('react');
var SongRow = require('./song-row.js');
var _ = require('lodash');

var SongList = React.createClass({
  render: function() {
    var _this = this;
    var songRows = _this.props.songs.map(function(song_info, index) {
      song_info.selected = _this.props.selectedVideoIndex == index;
      song_info.playing  = _this.props.playing;
      return <li className="list-group-item"> <SongRow {...song_info}/> </li>
    });
    if (_.isEmpty(this.props.songs)) {
      songRows = <p> Theres a first for everything </p>
    }
    return (
      <div>
        <ul className="list-group">
          {songRows}
        </ul>
      </div>
    );
  }
});

module.exports = SongList;

