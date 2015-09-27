var React = require('react');
var SongRow = require('./song-row.js');

var SongList = React.createClass({
  render: function() {
    var _this = this;
    var songRows = _this.props.songs.map(function(song_info, index) {
      song_info.selected = _this.props.selectedVideoIndex == index;
      song_info.playing  = _this.props.playing;
      return <li className="list-group-item"> <SongRow data={song_info}/> </li>
    });
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

