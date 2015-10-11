var React = require('react');
var Header = require('./header.js');
var Youtube = require('react-youtube');
var SearchBar = require('./searchbar.js');
var SongList = require('./song-list.js');
var cx = require('classnames');

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
    return {
      selectedVideoIndex: 0,
      playing: true,
      data: {"top": {songs: [], pageToken: 0}, "new": {songs: [], pageToken: 0}},
      sort: "top",
      userInfo: null
    };
  },

  componentDidMount: function() {
    var _this = this;

    this.serverPost("GetUserInfo", {}, {
      success: function(resp) { _this.setState({userInfo: resp}) }
    });

    _this.loadSongs("top");
    _this.loadSongs("new");
    $(window).scroll(function() {
      if($(window).scrollTop() + $(window).height() == $(document).height()) {
        _this.loadSongs(_this.state.sort);
      }
    });
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

  logoutHandler: function() {
    this.serverPost("Logout");
    this.setState({userInfo: null});
  },

  handleSearchSelection: function(song_info) {
    var _this = this;
    var region = _this.props.params.region || "Seattle";
    var postData =  {
      "RegionId": region,
      "SongId": song_info["youtube_id"],
      "SongTitle": song_info["youtube_title"],
      "ThumbnailUrl": song_info["thumbnail_url"]
    }
    this.serverPost("AddSongToRegion", postData, {
      success: function(resp) { _this.loadSongs(this.state.sort)}
    });
  },

  sendTokenHandler: function(userEmail) {
    var _this = this;
    var region = _this.props.params.region || "Seattle";
    var postData = { "UserEmail": userEmail };
    console.log(postData);
    this.serverPost("SendToken", postData, {});
  },

  handleUpvote: function(song_info) {
    var _this = this;
    var region = _this.props.params.region || "Seattle";
    var postData =  {
      "RegionId": region,
      "SongId": song_info["youtube_id"]
    }
    this.serverPost("UpvoteSong", postData);
  },

  serverPost: function(operation, data, handlers) {
    if( handlers == null || handlers === undefined) {
      handlers = {}
    }
    if (data == null || data === undefined) {
      data = {}
    }

    $.ajax({
      url: "/",
      type: "POST",
      headers: { "X-Bop-Operation": operation,
        "X-Bop-Version": "v1",
        "Content-Type": "application/json"
      },
      data: JSON.stringify(data),
      success: handlers["success"],
      error: handlers["error"]
    });
  },

  playVideo: function(videoId) {
    if (typeof videoId === 'string' || videoId instanceof String) {
     var index = 0;
     while (this.state.data[this.state.sort].songs[index].youtube_id !== videoId) {
       index++;
     }
     // only reload video if its new
     if (this.state.selectedVideoIndex != index) {
       this.player.loadVideoById(this.state.data[this.state.sort].songs[index].youtube_id);
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
    this.player.loadVideoById(this.state.data[this.state.sort].songs[this.state.selectedVideoIndex+1].youtube_id);
    this.setState({selectedVideoIndex: this.state.selectedVideoIndex + 1});
  },

  setPlayer: function(e) {
    this.player = e.target;
    if(this.state.data[this.state.sort].songs.length > 0) {
      this.player.loadVideoById(this.state.data[this.state.sort].songs[this.state.selectedVideoIndex].youtube_id);
    }
    this.player.pauseVideo();
  },

  loadSongs: function(type) {
    var _this = this;
    var region = _this.props.params.region || "Seattle";
    var operation;
    var postData = { "RegionId": region, "InputToken": this.state.data[type].pageToken, "Type": type};
    _this.serverPost("GetSongsInRegion", postData, {
      success: function(resp) {
        var pageToken = resp['OutputToken'];
        var songs = resp['Songs'];
        songs = songs.map(function(elem, i) {
          elem.clickPlayHandler = _this.clickPlayHandler;
          elem.upvoteHandler = _this.handleUpvote;
          return elem
        });
        songs = _this.state.data[type].songs.concat(songs);
        var data = _this.state.data;
        data[type] = {songs: songs, pageToken: pageToken};
        _this.setState({data: data});
      }
    });
  },

  setSort: function(sort) {
    var _this = this;
    return function() {
      _this.setState({sort: sort});
    }
  },

  render: function () {
    var region = this.props.params.region || "Seattle";
    var hotBtnClasses = cx("filter-btn", {active: this.state.sort === "top"});
    var newBtnClasses = cx("filter-btn", {active: this.state.sort === "new"});

    return (
      <div className="row">
        <div className="row">
          <Header region={region} sendTokenHandler={this.sendTokenHandler} userInfo={this.state.userInfo} logoutHandler={this.logoutHandler}/>
        </div>
        <div className="row">
          <Youtube url={YOUTUBE_PREFIX} id={'video'} opts={opts} onEnd={this.playNextSong} onReady={this.setPlayer} onPause={this.pauseVideo} onPlay={this.playVideo}/>
        </div>
        <div className={'row'} id={'gradient_bar'}>
          <div className="btn-group col-xs-3 col-xs-offset-4" role="group">
            <div className={hotBtnClasses} onClick={this.setSort("top")}>Hot</div>
            <div className={newBtnClasses} onClick={this.setSort("new")}>New</div>
          </div>
          <div className="col-xs-4 col-xs-offset-1"> <SearchBar handleSelection={this.handleSearchSelection}/> </div>
        </div>
        <div className="row">
            <SongList songs={this.state.data[this.state.sort].songs} selectedVideoIndex={this.state.selectedVideoIndex} playing={this.state.playing}/>
        </div>
    </div>
  );
  }
});

module.exports = Landing;

