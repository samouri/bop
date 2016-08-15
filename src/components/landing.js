const _ = require('lodash');
const React = require('react');
const Header = require('./header.js');
const Waypoint = require('react-waypoint');

const Youtube = require('react-youtube');
const SearchBar = require('./searchbar.js');
const FTUEHero = require('./ftueBanner.js');
const SongList = require('./song-list.js');
const cx = require('classnames');
const config = require('../config.js');


const Swagger = require('swagger-client');
let swaggerClientPromise = new Swagger({ url: config.swaggerUrl, usePromise: true });
let sdkConstructor = require('../sdk');
let sdk;

swaggerClientPromise
	.then( (client) => {
		console.log(client);
		sdk = new sdkConstructor(client);
	}).catch( (err) => {
		console.log(err);
	});

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
      selectedVideoId: null,
      showFTUEHero: true,
      playing: true,
      data: {"top": {songs: [], pageToken: 0}, "new": {songs: [], pageToken: 0}},
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
    this.setState({data: {"top": {songs: [], pageToken: 0}, "new": {songs: [], pageToken: 0}}}),
    this.loadSongs("top",  newProps.params.region);
    this.loadSongs("new", newProps.params.region);
  },

  clickPlayHandler: function(videoId, type) {
    var _this = this;
    // fa-play
    if (! _.isString(type) || type.indexOf('pause') == -1) {
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
    var operation = "AddSongToRegion";
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

  serverPost: function(operation, data, handlers) {
    return "well this wont work will it";
  },

  currentlyPlayingVideoIndex: function() {
    var songYoutubeIds = _.map(this.state.data[this.state.sort].songs, "youtube_id");
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
    this.setState({playing: true, showFTUEHero: false});
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
    var operation = "GetSongsInRegion";
    var postData = { "RegionId": region, "InputToken": 0, "Type": type};
    sdk.getSongsForPlaylist( region ).then( (resp) => {
			var pageToken = resp['OutputToken'];
			var songs = resp['Songs'];
			songs = songs.map(function(elem, i) {
				elem.clickPlayHandler = _this.clickPlayHandler;
				elem.upvoteHandler = _this.handleUpvote;
				return elem
			});
			var data = _this.state.data;
			data[type] = {songs: songs, pageToken: pageToken};
			_this.setState({data: data});
		});
  },

  loadSongs: function(type, regionId) {
    type = type || this.state.sort;
    var _this = this;
    var region = regionId || _this.props.params.region || "Seattle";
		if (_.isUndefined(sdk)) {
      clearInterval(_this.interval);
			_this.interval = setInterval(() => {
        console.log('yay check');
				_this.loadSongs(type, regionId)
			}, 100);
		} else {
      clearInterval(_this.interval);
			sdk.getSongsForPlaylist( region ).then( (resp) => {
				var pageToken = resp['OutputToken'];
				var songs = resp['Songs'];
				songs = songs.map(function(elem, i) {
					elem.clickPlayHandler = _this.clickPlayHandler;
					elem.upvoteHandler = _this.handleUpvote;
					return elem
				});
				songs = _.union(_this.state.data[type].songs, songs);
				var data = _this.state.data;
				data[type] = {songs: songs, pageToken: pageToken};
				_this.setState({data: data});
			});
		}
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

    return (
      <div className="row">
        <div className="row">
          <Header region={region} sendTokenHandler={this.sendTokenHandler} userInfo={this.state.userInfo} logoutHandler={this.logoutHandler}/>
        </div>
        <div className={!this.state.showFTUEHero? "hidden" : 'row'}>
          <FTUEHero handlePlayClick={this.clickPlayHandler()}/>
        </div>
        <div className={this.state.showFTUEHero? "hidden" : 'row'}>
          <Youtube url={YOUTUBE_PREFIX} id={'video'} opts={opts} onEnd={this.playNextSong} onReady={this.setPlayer} onPause={this.pauseVideo} onPlay={this.playVideo}/>
        </div>
        <div className={'row'} id={'gradient_bar'}>
          <div className="btn-group col-xs-3 col-xs-offset-4" role="group">
            <div className={hotBtnClasses} onClick={this.setSort("top")}>Hot</div>
            <div className={newBtnClasses} onClick={this.setSort("new")}>New</div>
          </div>
          <div className="col-xs-4 col-xs-offset-1"> <SearchBar handleSelection={_.throttle(this.handleSearchSelection, 100)}/> </div>
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

