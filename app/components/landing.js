var _ = require('underscore');
const React = require('react');
var Navigation = require('react-router').Navigation;
const Header = require('./header.js');
var sha1 = require('sha1');
const Waypoint = require('react-waypoint');

const Youtube = require('react-youtube');
const SearchBar = require('./searchbar.js');
const SongList = require('./song-list.js');
var config = require('../../server/config');
const cx = require('classnames');


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
  mixins: [Navigation],

  getInitialState: function() {
    return {
      selectedVideoId: null,
      playing: true,
      data: {"top": {songs: [], pageToken: 0}, "new": {songs: [], pageToken: 0}, "star": {songs: [], pageToken: 0}},
      sort: "top",
      userInfo: {}
    };
  },

  componentDidMount: function() {
    var _this = this;

    this.serverPost("GetUserInfo", {}, {
      success: function(resp) { _this.setState({userInfo: resp}) }
    });

    _this.loadSongs("new");
  },

  componentWillReceiveProps: function(newProps) {
    this.setState({data: {"top": {songs: [], pageToken: 0}, "new": {songs: [], pageToken: 0}, "star": { songs: [], pageToken: 0}}}),
    this.loadSongs("top",  newProps.params.region);
    this.loadSongs("new", newProps.params.region);
    this.loadSongs("star");
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
    this.setState({userInfo: {}});
  },

  handleSearchSelection: function(song_info) {
    var _this = this;
    var region = _this.props.params.region || "Seattle";
    var operation = (_this.state.sort === "star")? "AddSongToUser" : "AddSongToRegion";
    var postData =  {
      "RegionId": region,
      "SongId": song_info["youtube_id"],
      "SongTitle": song_info["youtube_title"],
      "ThumbnailUrl": song_info["thumbnail_url"]
    }
    this.serverPost(operation, postData, {
      success: function(resp) {
        _this.loadSongsAndReset(_this.state.sort)
      }
    });
  },

  sendTokenHandler: function(userEmail) {
    var _this = this;
    var region = _this.props.params.region || "Seattle";
    var postData = { "UserEmail": userEmail };
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

  handleStar: function(song_info) {
    var _this = this;

    var postData =  {
      "SongId": song_info["youtube_id"],
      "SongTitle": song_info.track,
      "SongArtist": song_info.artist,
      "ThumbnailUrl": song_info["thumbnail_url"]
    };

    this.serverPost("AddSongToUser", postData);
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

  currentlyPlayingVideoIndex: function() {
    var songYoutubeIds = _.pluck(this.state.data[this.state.sort].songs, "youtube_id");
    return songYoutubeIds.indexOf(this.state.selectedVideoId);
  },

  playVideo: function(videoId) {
    if (typeof videoId === 'string' || videoId instanceof String) {
     // only reload video if its new
     if (this.state.selectedVideoIndex != this.currentlyPlayingVideoIndex()) {
       this.player.loadVideoById(videoId);
       this.setState({selectedVideoId: videoId});
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
    var currIndex = this.currentlyPlayingVideoIndex();
    this.playVideo(this.state.data[this.state.sort].songs[currIndex+1].youtube_id);
  },

  setPlayer: function(e) {
    this.player = e.target;
    if(this.state.data[this.state.sort].songs.length > 0) {
      this.player.loadVideoById(this.state.data[this.state.sort].songs[0].youtube_id);
      this.setState({selectedVideoId: this.state.data[this.state.sort].songs[0].youtube_id});
    }
    this.pauseVideo();
  },

  loadSongsAndReset: function(type, regionId) {
    type = type || this.state.sort;
    var _this = this;
    var region = regionId || _this.props.params.region || "Seattle";
    var operation = (type === "star")? "GetSongsForUser" : "GetSongsInRegion";
    var postData = { "RegionId": region, "InputToken": 0, "Type": type};
    _this.serverPost(operation, postData, {
      success: function(resp) {
        var pageToken = resp['OutputToken'];
        var songs = resp['Songs'];
        songs = songs.map(function(elem, i) {
          elem.clickPlayHandler = _this.clickPlayHandler;
          elem.upvoteHandler = _this.handleUpvote;
          elem.starHandler = _this.handleStar;
          return elem
        });
        var data = _this.state.data;
        data[type] = {songs: songs, pageToken: pageToken};
        _this.setState({data: data});
      }
    });
  },

  loadSongs: function(type, regionId) {
    type = type || this.state.sort;
    var _this = this;
    var region = regionId || _this.props.params.region || "Seattle";
    var operation = (type === "star")? "GetSongsForUser" : "GetSongsInRegion";
    var postData = { "RegionId": region, "InputToken": this.state.data[type].pageToken, "Type": type};
    _this.serverPost(operation, postData, {
      success: function(resp) {
        var pageToken = resp['OutputToken'];
        var songs = resp['Songs'];
        songs = songs.map(function(elem, i) {
          elem.clickPlayHandler = _this.clickPlayHandler;
          elem.upvoteHandler = _this.handleUpvote;
          elem.starHandler = _this.handleStar;
          return elem
        });
        songs = _.union(_this.state.data[type].songs, songs);
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
    var hotBtnClasses = cx("filter-btn", "pointer", {active: this.state.sort === "top"});
    var newBtnClasses = cx("filter-btn", "pointer", {active: this.state.sort === "new"});
    var starBtnClasses = cx("fa fa-star fa-2x", "pointer", "col-xs-1", {active: this.state.sort === "star"});

    return (
      <div className="row">
        <div className="row">
          <Header region={region} sendTokenHandler={this.sendTokenHandler} userInfo={this.state.userInfo} logoutHandler={this.logoutHandler}/>
        </div>
        <div className="row">
          <Youtube url={YOUTUBE_PREFIX} id={'video'} opts={opts} onEnd={this.playNextSong} onReady={this.setPlayer} onPause={this.pauseVideo} onPlay={this.playVideo}/>
        </div>
        <div className={'row'} id={'gradient_bar'}>
          <i className={starBtnClasses} onClick={this.setSort("star")}></i>
          <div className="btn-group col-xs-3 col-xs-offset-3" role="group">
            <div className={hotBtnClasses} onClick={this.setSort("top")}>Hot</div>
            <div className={newBtnClasses} onClick={this.setSort("new")}>New</div>
          </div>
          <div className="col-xs-4 col-xs-offset-1"> <SearchBar handleSelection={this.handleSearchSelection}/> </div>
        </div>
        <div className="row">
          <SongList songs={this.state.data[this.state.sort].songs} selectedVideoIndex={this.currentlyPlayingVideoIndex()} playing={this.state.playing}/>
        </div>
        <Waypoint onEnter={_.throttle(this.loadSongs.bind(this, this.state.sort, undefined), 50)} threshold={0} height="50px"/>
      </div>
    );
  }
});
module.exports = Landing;

