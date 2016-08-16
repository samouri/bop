import _ from 'lodash'
import React from 'react';
import Swagger from 'swagger-client';
import Youtube from 'react-youtube';
import cx from 'classnames';

import Header from './header';
import SongList from './song-list';
import SearchBar from './searchbar';
import FTUEHero from './ftueBanner';
import config from '../config';

let swaggerClientPromise = new Swagger({ url: config.swaggerUrl, usePromise: true });
let BopSdk = require('../sdk');
let sdk;

const YOUTUBE_PREFIX = "https://www.youtube.com/watch?v="
const TOP = 'top';
const NEW = 'new';
const PAGE_SIZE = 100

const opts = {
  playerVars: { // https://developers.google.com/youtube/player_parameters
    autoplay: 0,
    controls: 1,
    enablejsapi: 1,
    modestbranding: 1,
    playsinline: 1
  }
}

export default class Landing extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      selectedVideoId: null,
      showFTUEHero: true,
      playing: false,
      songs: [],
      page: 0,
      sort: TOP,
      upvotes: {},
      userInfo: {}
    }
  }

  componentDidMount() {
    swaggerClientPromise
    .then( (client) => {
      sdk = new BopSdk(client);

      this.loadSongs(TOP);

      let login = localStorage.getItem('login');
      if (login) {
        login = JSON.parse(login);
        this.handleLogin(login);
      }
    })
    .catch( (err) => {
      console.log(err);
    });
  }

  logoutHandler() {
    // TODO remove credentials from user storage and refresh data
    this.setState({userInfo: {}});
  }

  handleOnPause = (event) => {
    // pause video
    this.player.pauseVideo();
    this.setState({playing: false});
  }

  handleOnEnd = () => {
    // play next song
    let songs = this.sortedSongs();
    var currIndex = _.findIndex(songs, {youtube_id: this.selectedVideoId});
    this.playVideo(this.state.songs[currIndex+1].youtube_id);
  }

  handleOnReady = (e) => {
    // set player
    this.player = e.target;
    let songs = this.sortedSongs();

    if(this.state.songs.length > 0) {
      let selectedVideoId = songs[0].youtube_id;

      this.player.cueVideoById({videoId: selectedVideoId});
      this.setState({ selectedVideoId });
    }
  }

  handleSearchSelection = (searchMetadata) => {
    let { playlist = 'Seattle' } = this.props.params;

    // get metadata, add the song, then add it locally
    sdk.getSongMetadata(searchMetadata.youtube_title)
    .then( (resp) => {
      let songMetadata = resp.obj;
      let song = songMetadata;
      song.thumbnail_url = searchMetadata.thumbnail_url;
      song.youtube_id = searchMetadata.youtube_id;

      return sdk.addSongToPlaylist(playlist, song)
    })
    .then( (resp) => {
      let addedSong = resp.obj;
      let songs = this.state.songs.concat(addedSong);

      this.setState({songs});
    })
    .catch( (err) => {
      alert('sorry, video is incompatible');
      console.log(err);
    })
  }

  handleUpvote = (song_info, voteDiff) => {
    let { playlist = 'Seattle' } = this.props.params;
    let songId = song_info['youtube_id'];

    // instantly change the vote on screen
    let songs = this.sortedSongs();
    var votedSongIndex = _.findIndex(songs, {youtube_id: songId});
    songs[votedSongIndex].upvotes += voteDiff === 0? -1 : 1;

    let upvotes = _.clone(this.state.upvotes);
    upvotes[song_info['_id']] = voteDiff > 0;

    this.setState({songs, upvotes});

    // also register vote with server
    sdk.vote(playlist, songId, voteDiff);
  }

  handleOnPlay = (videoId) => {
    this.playVideo(videoId);
  }

  handleLogin = (login) => {
    localStorage.setItem('login', JSON.stringify(login));

    sdk.login(login.username, login.password);
    sdk.getUser()
      .then( (res) => {
        this.setState({
          upvotes: res.obj.upvotedSongs,
          username: login.username
        });
      })
      .catch( (err) => console.log(err));
  }

  handleSetSort = (sort) => {
    return () => this.setState({sort});
  }

  playVideo(videoId) {
    if (typeof videoId === 'string' || videoId instanceof String) {
     // only reload video if its new
     if (this.state.selectedVideoId !== videoId) {
       this.player.loadVideoById(videoId);
       this.setState({selectedVideoId: videoId});
     }
    }
    this.setState({playing: true, showFTUEHero: false});
    this.player.playVideo();
  }

  loadSongs(start) {
    let { playlist = 'Seattle' } = this.props.params;

    sdk.getSongsForPlaylist( playlist, start, PAGE_SIZE )
      .then( (resp) => {
        let songs = resp.obj.songs;
        let page = resp.obj.next;

        songs = _.union(this.state.songs, songs);

        this.setState({ songs, page });
      })
      .catch( (err) => console.log(err) );
  }

  sortedSongs() {
    let sort = this.state.sort;

    if (sort === TOP) {
      return _.reverse(_.sortBy(this.state.songs, ['upvotes', 'creation_date']));
    } else if (sort === NEW) {
      return _.reverse(_.sortBy(this.state.songs, ['creation_date', 'upvotes']));
    }
  }

  render() {
    let sort = this.state.sort;
    let { playlist = 'Seattle' } = this.props.params;
    var hotBtnClasses = cx("filter-btn", "pointer", {active: sort === TOP});
    var newBtnClasses = cx("filter-btn", "pointer", {active: sort === NEW});

    let songs = this.sortedSongs();

    return (
      <div className="row">
        <div className="row">
          <Header playlist={playlist} onLogin={this.handleLogin} username={this.state.username} />
        </div>
        <div className={!this.state.showFTUEHero? "hidden" : 'row'}>
          <FTUEHero onPlay={this.handleOnPlay}/>
        </div>
        <div className={this.state.showFTUEHero? "hidden" : 'row'}>
          <Youtube url={YOUTUBE_PREFIX} id={'video'} opts={opts} onEnd={this.handleOnEnd} onReady={this.handleOnReady} onPause={this.handleOnPause} onPlay={this.handleOnPlay}/>
        </div>
        <div className={'row'} id={'gradient_bar'}>
          <div className="btn-group col-xs-3 col-xs-offset-4" role="group">
            <div className={hotBtnClasses} onClick={this.handleSetSort(TOP)}>Hot</div>
            <div className={newBtnClasses} onClick={this.handleSetSort(NEW)}>New</div>
          </div>
          <div className="col-xs-4 col-xs-offset-1"> <SearchBar handleSelection={_.throttle(this.handleSearchSelection, 100)}/> </div>
        </div>
        <div className="row">
          <SongList songs={songs} upvotes={this.state.upvotes} playing={this.state.playing} selectedVideoId={this.state.selectedVideoId}
                    onPause={this.handleOnPause} onPlay={this.handleOnPlay} onUpvote={this.handleUpvote}/>
        </div>
      </div>
    );
  }
}

