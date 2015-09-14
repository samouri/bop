var React = require('react');
var Youtube = require('react-youtube');
var Griddle = require('griddle-react');
var SongRow = require('./song-row.js');

var FAKE_DATA = [{"youtube_id":"iP6XpLQM2Cs","upvotes":12,"user_upvote":0,"region_id":"98102","age":"2h","metadata":{"artist":"Ke$ha","track":"Tik Tok","duration":"4:36","thumbnail_url":"https://33.media.tumblr.com/avatar_868f2b44b588_128.png"}},{"youtube_id":"yFTvbcNhEgc","upvotes":100,"user_upvote":0,"region_id":"98102","age":"2h","metadata":{"artist":"Angus and Julia Stone","track":"Big Jet Plane","duration":"4:36","thumbnail_url":"http://33.media.tumblr.com/avatar_9361c5a980d9_128.png"}},{"youtube_id":"ugGN_Z1jPoM","upvotes":20,"user_upvote":0,"region_id":"98102","age":"2h","metadata":{"artist":"Benjamin Clementine","track":"Nemesis","duration":"4:36","thumbnail_url":"http://s3.evcdn.com/images/block/I0-001/020/753/082-2.jpeg_/benjamin-clementine-82.jpeg"}},{"youtube_id":"Bk12a5aklPg","upvotes":20,"user_upvote":0,"region_id":"98102","age":"2h","metadata":{"artist":"Handsome Ghost","track":"Blood Stutter","duration":"4:36","thumbnail_url":"http://38.media.tumblr.com/avatar_7ec096677bbc_128.png"}}]

var YOUTUBE_PREFIX = "https://www.youtube.com/watch?v="
const opts = {
  playerVars: { // https://developers.google.com/youtube/player_parameters
    autoplay: 1,
    controls: 1,
    enablejsapi: 1,
    modestbranding: 1,
    playsinline: 1
  }
}

var Landing = React.createClass({
  getInitialState: function() {
    this.data = FAKE_DATA;
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

  playVideo: function(videoId) {
    if ($.isNumeric(videoId)) {
     var index = 0;
     while (this.data[index].youtube_id !== videoId) {
       index++;
     }
      // only reload video if its new
      if (this.state.selectedVideoIndex != index) {
        this.player.loadVideoById(_this.data[index].youtube_id);
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
    this.player.loadVideoById(this.data[this.state.selectedVideoIndex].youtube_id);
  },

  render: function () {
    var _this = this;

    var fakeData = _this.data.map(function(elem, i) {
      elem.clickPlayHandler = _this.clickPlayHandler;
      elem.selected = i == _this.state.selectedVideoIndex;
      elem.playing = _this.state.playing;
      elem.threeDigitUpvotes = elem.upvotes.toString().length >= 3;
      return elem
    });

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
            <div className="col-xs-3 col-xs-offset-1"> <h1 className="pull-right" id="post_song"> Post song </h1> </div>
            <div className="col-xs-1"> <i className="fa fa-3x fa-search-plus"></i> </div>
          </div>
          <Griddle results={fakeData} gridClassName={'row'} useCustomRowComponent={true} customRowComponent={SongRow} enableToggleCustom={true} />
      </div>
    );
  }
});

module.exports = Landing;

