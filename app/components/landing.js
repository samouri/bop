var React = require('react');
var Header = require('./header.js');
var Youtube = require('react-youtube');
var SearchBar = require('./searchbar.js');
var SongList = require('./song-list.js');

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
    this.optimisticAdds = [];
    return {
      selectedVideoIndex: 0,
      playing: true,
      data: [],
      pageToken: 0
    };
  },

  componentDidMount: function() {
    var _this = this;
    _this.loadSongs();
    $(window).scroll(function() {
      if($(window).scrollTop() + $(window).height() == $(document).height()) {
        _this.loadSongs();
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

  handleSearchSelection: function(song_info) {
    var _this = this;
    var region = _this.props.params.region || "Seattle";
    //this.setState({selectedVideoIndex: -1});
    //this.optimisticAdd(song_info);
    //this.playVideo(song_info.youtube_id);
    var postData =  {
      "RegionId": region,
      "SongId": song_info["youtube_id"],
      "SongTitle": song_info["youtube_title"],
      "ThumbnailUrl": song_info["thumbnail_url"]
    }
    this.serverPost("AddSongToRegion", postData, {
      success: function(resp) { _this.loadSongs()}
    });
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

  optimisticAdd: function(song_info) {
    song_info.clickPlayHandler = this.clickPlayHandler;
    song_info.threeDigitUpvotes = song_info.upvotes.toString().length >= 3;
    this.optimisticAdds.unshift(song_info);
  },

  playVideo: function(videoId) {
    if (typeof videoId === 'string' || videoId instanceof String) {
     var index = 0;
     while (this.state.data[index].youtube_id !== videoId) {
       index++;
     }
     // only reload video if its new
     if (this.state.selectedVideoIndex != index) {
       this.player.loadVideoById(this.state.data[index].youtube_id);
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
    this.player.loadVideoById(this.state.data[this.state.selectedVideoIndex+1].youtube_id);
    this.setState({selectedVideoIndex: this.state.selectedVideoIndex + 1});
  },

  setPlayer: function(e) {
    this.player = e.target;
    if(this.state.data.length > 0) {
      this.player.loadVideoById(this.state.data[this.state.selectedVideoIndex].youtube_id);
    }
    this.player.pauseVideo();
  },

  loadSongs: function() {
    var _this = this;
    var region = _this.props.params.region || "Seattle";
    var postData = { "RegionId": region, "InputToken": this.state.pageToken};
    _this.serverPost("GetTopSongsInRegion", postData, {
      success: function(resp) {
        var data = JSON.parse(resp);
        var pageToken = data['OutputToken'];
        if (pageToken) {
          pageToken = pageToken;
        } else {
          pageToken = parseInt(_this.state.pageToken) + data['Songs'].length;
        }

        var songs = data['Songs'];
        console.log(songs);
        songs = songs.concat(_this.optimisticAdds);
        songs = songs.map(function(elem, i) {
          elem.clickPlayHandler = _this.clickPlayHandler;
          elem.upvoteHandler = _this.handleUpvote;
          elem.threeDigitUpvotes = elem.upvotes.toString().length >= 3;
          return elem
        });
        songs = _this.state.data.concat(songs);
        _this.setState({data: songs, pageToken: pageToken});
      }
    });
  },

  render: function () {
    var _this = this;
    var region = _this.props.params.region || "Seattle";
    return (
      <div className="row">
        <Header region={region} />
        <div className="row">
          <Youtube url={YOUTUBE_PREFIX} id={'video'} opts={opts} onEnd={this.playNextSong} onReady={this.setPlayer} onPause={this.pauseVideo} onPlay={this.playVideo}/>
        </div>
        <div className={'row'} id={'gradient_bar'}>
          <div className="btn-group col-xs-3 col-xs-offset-4" role="group">
            <div className="filter-btn active">Hot</div>
            <div className="filter-btn">New</div>
          </div>
          <div className="col-xs-4 col-xs-offset-1"> <SearchBar handleSelection={this.handleSearchSelection}/> </div>
        </div>
        <div className="row">
            <SongList songs={_this.state.data} selectedVideoIndex={_this.state.selectedVideoIndex} playing={_this.state.playing}/>
        </div>
    </div>
  );
  }
});

module.exports = Landing;

