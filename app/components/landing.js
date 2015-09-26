var React = require('react');
var Youtube = require('react-youtube');
var Griddle = require('griddle-react');
var GriddleWithCallback = require('griddle-callback');
var SongRow = require('./song-row.js');
var SearchBar = require('./searchbar.js');

var YOUTUBE_PREFIX = "https://www.youtube.com/watch?v="
const opts = {
  playerVars: { // https://developers.google.com/youtube/player_parameters
    autoplay: 0,
    controls: 1,
    enablejsapi: 1,
    modestbranding: 1,
    playsinline: 1
  }
}

var Landing = React.createClass({
  getInitialState: function() {
    this.data = [];
    this.optimisticAdds = [];
    return {
      selectedVideoIndex: 0,
      playing: true
    };
  },

  clickPlayHandler: function(videoId, type) {
    var _this = this;
    // fa-play
    if (type.indexOf('pause') == -1) {
      return function(e) {
        _this.playVideo(videoId);
      }
    }
    // fa-pause
    return function(e) {
      _this.pauseVideo();
    }
  },

  handleSearchSelection: function(song_info) {
    this.setState({selectedVideoIndex: -1});
    this.optimisticAdd(song_info);
    this.playVideo(song_info.youtube_id);
  },

  optimisticAdd: function(song_info) {
    song_info.clickPlayHandler = this.clickPlayHandler;
    song_info.selected = false;
    song_info.playing = this.state.playing;
    song_info.threeDigitUpvotes = song_info.upvotes.toString().length >= 3;
    this.optimisticAdds.unshift(song_info);
  },

  playVideo: function(videoId) {
    if (typeof videoId === 'string' || videoId instanceof String) {
     var index = 0;
     while (this.data[index].youtube_id !== videoId) {
       index++;
     }
     // only reload video if its new
     if (this.state.selectedVideoIndex != index) {
       this.player.loadVideoById(this.data[index].youtube_id);
       this.setState({selectedVideoIndex: index});
     }
    }
    this.setState({playing: true});
    this.player.playVideo();
  },

  pauseVideo: function(event) {
    this.player.pauseVideo();
    this.setState({playing: false});
  },

  playNextSong: function() {
    this.player.loadVideoById(this.data[this.state.selectedVideoIndex+1].youtube_id);
    this.setState({selectedVideoIndex: this.state.selectedVideoIndex + 1});
  },

  setPlayer: function(e) {
    this.player = e.target;
    this.player.loadVideoById(this.data[this.state.selectedVideoIndex+1].youtube_id);
    this.player.pauseVideo();
  },

  loadSongs: function(filterString, sortColumn, sortAscending, page, pageSize, callback) {
    var _this = this;
    $.ajax({
      url: "http://0.0.0.0:5000/",
      type: "POST",
      headers: {
        "X-Bop-Operation": "GetTopSongsInRegion",
        "X-Bop-Version": "v1",
        "Content-Type": "application/json"
      },
      data: JSON.stringify({ "RegionId": "Seattle"}),
      success: function(resp) {
        var data = JSON.parse(resp);
        var songs = data['Songs'];
        songs = songs.concat(_this.optimisticAdds);
        _this.data = songs.map(function(elem, i) {
          elem.clickPlayHandler = _this.clickPlayHandler;
          elem.selected = i == _this.state.selectedVideoIndex;
          elem.playing = _this.state.playing;
          elem.threeDigitUpvotes = elem.upvotes.toString().length >= 3;
          return elem
        });
        console.log(_this.data);
        callback({
          results: _this.data,
          currentPage: page
        });
      }
    });
  },

  render: function () {
    var _this = this;
    return (
      <div className="row">
          <div className="row">
            <Youtube url={YOUTUBE_PREFIX} id={'video'} opts={opts} onEnd={this.playNextSong} onReady={this.setPlayer} onPause={this.pauseVideo} onPlay={this.playVideo}/>
          </div>
          <div className={'row'} id={'gradient_bar'}>
            <div className="btn-group col-xs-2 col-xs-offset-5" role="group">
              <button type="button" className="btn btn-default">Hot</button>
              <button type="button" className="btn btn-default">New</button>
            </div>
            <div className="col-xs-4 col-xs-offset-1"> <SearchBar handleSelection={this.handleSearchSelection}/> </div>
          </div>
          <GriddleWithCallback gridClassName={'row'} useCustomRowComponent={true} customRowComponent={SongRow} enableToggleCustom={true}
            getExternalResults={this.loadSongs} enableInfiniteScroll={true} resultsPerPage={5} />
      </div>
    );
  }
});

module.exports = Landing;

