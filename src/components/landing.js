import _ from 'lodash'
import React from 'react';
import { connect } from 'react-redux';
import Youtube from 'react-youtube';
import cx from 'classnames';

import Header from './header';
import SearchBar from './searchbar';
import FTUEHero from './ftueBanner';
import SongRow from './song-row';

import BopSdk from '../sdk';
import { fetchSongsSuccess, fetchSongs, loginUser, playSong, pauseSong, setSort, shuffleSongs } from '../app/actions';
import { getCurrentSort, getCurrentPlaylist, getUpvotedSongs, getUsername, getCurrentSong, getSongById, getSortedSongs,
	getNextSong, } from '../app/reducer';

let sdk;

const YOUTUBE_PREFIX = "https://www.youtube.com/watch?v="
const TOP = 'top';
const NEW = 'new';
const SHUFFLE = 'shuffle';

const opts = {
  playerVars: { // https://developers.google.com/youtube/player_parameters
    autoplay: 0,
    controls: 1,
    enablejsapi: 1,
    modestbranding: 1,
    playsinline: 1
  }
}

function mapStateToProps( state ) {
	return {
			songs: getSortedSongs( state ),
			username: getUsername( state ),
			upvotedSongs: getUpvotedSongs( state ),
			currentSong: getCurrentSong( state ),
			currentPlaylist: getCurrentPlaylist( state ),
			showFTUEHero: getCurrentSong( state ) === null,
	 		getSongById: _.partial( getSongById, state),
	 		sort: getCurrentSort( state ),
	 		nextSong: getNextSong( state ),
	}
}

export default connect( mapStateToProps )(class Landing extends React.Component {

	state = {
      selectedVideoId: null,
      playing: false,
      songs: [],
      page: 0,
      sort: TOP,
      upvotes: {},
      userInfo: {},
			sdk: null,
	}

  componentDidMount() {

    new BopSdk()
			.then( ( client ) => {
				sdk = client;
				this.setState( { sdk } );
				return this.props.dispatch( fetchSongs( this.props.currentPlaylist, sdk ) );
			})
			.then( () => {
				let login = localStorage.getItem('login');
				if (login) {
					login = JSON.parse(login);
					this.props.dispatch( loginUser( login, sdk ) );
				}
			})
			.catch( (err) => {
				console.error(err, err.stack);
			});
  }

  handleOnPause = (event) => {
		this.props.dispatch( pauseSong( this.props.currentSong.songId ) );
  }

  handleOnEnd = () => {
    // play next song
		this.props.dispatch( playSong( this.props.nextSong ) );
  }

  handleOnReady = (e) => {
    // set player
    this.player = e.target;

    if( this.props.songs.length > 0) {
      let selectedVideoId = this.props.songs[0].youtube_id;

      this.player.cueVideoById({videoId: selectedVideoId});
      this.setState({ selectedVideoId });
    }
  }

  handleSearchSelection = ( searchMetadata ) => {
    let { playlist = 'Seattle' } = this.props.params;
		searchMetadata.playlist_id = playlist;

    // get metadata, add the song, then add it locally
    sdk.getSongMetadata(searchMetadata.youtube_title)
    .then( resp => {
			return {
				title: searchMetadata.youtube_title, // we should override with songMetadata results
				...searchMetadata,
				...resp.obj
			};
    } ) //TODO reduxify adding of songs
    .then( song => sdk.addSongToPlaylist( playlist, song ) )
		.then( resp => {
			this.props.dispatch( fetchSongsSuccess( playlist, [ resp.obj ] ) );
		})
		.catch( err => {
			console.error( 'seems like we couldnt add a song', err, err.stack );
		} );
  }

  handleOnPlay = ( songId ) => {
		this.props.dispatch( playSong( this.props.currentSong.songId ) );
  }

  handleRegister = ( login ) => {
		console.log( 'attempting to create user' );
		this.state.sdk.putUser(login.username, login.password)
			.then( ( resp ) => {
				this.props.dispatch( loginUser( login, sdk ) );
			} );
  }

  playVideo( songId ) {
    if ( this.props.currentSong.invalidatedSong ) {
     // only reload video if its new
		 const videoId = this.props.getSongById( songId ).youtube_id;
		 this.player.loadVideoById( videoId );
    }
    this.player.playVideo();
  }

	renderSongsList = () => {
		if ( _.isEmpty( this.props.songs ) ) {
			return <p> Theres a first for everything </p>;
		} else {
			return _.map( this.props.songs,
				( song ) => <li className="list-group-item">
					<SongRow songId={ song._id } sdk={ this.state.sdk } key={ `song-${song._id}` }/>
				</li>
			)
		}
	}

  render() {
    const sort = this.props.sort.sort;
    const shuffle = this.props.sort.shuffle;
    let { playlist = 'Seattle' } = this.props.params;
    var hotBtnClasses = cx("filter-btn", "pointer", {active: sort === TOP});
    var newBtnClasses = cx("filter-btn", "pointer", {active: sort === NEW});
    var shuffleBtnClasses = cx("pointer", 'fa', 'fa-random', {active: shuffle });

    let songs = this.props.songs;

		if ( this.props.currentSong && this.props.currentSong.playing ) {
			this.playVideo( this.props.currentSong.songId )
		} else if ( this.props.currentSong && ! this.props.currentSong.playing ) {
			this.player.pauseVideo();
		}

    return (
      <div className="row">
        <div className="row">
          <Header onLogin={ ( login ) => this.props.dispatch( loginUser( login, sdk ) ) } onRegister={ this.handleRegister }/>
        </div>

				{ this.props.showFTUEHero && <FTUEHero /> }

        <div className={this.props.showFTUEHero ? "hidden" : 'row'}>
          <Youtube url={YOUTUBE_PREFIX} id={'video'} opts={opts} onEnd={this.handleOnEnd} onReady={this.handleOnReady} onPause={this.handleOnPause} onPlay={this.handleOnPlay}/>
        </div>
        <div className={'row'} id={'gradient_bar'}>
					<div className="col-xs-offset-4 cols-xs-1">
						<i className={shuffleBtnClasses} onClick={ () => this.props.dispatch( shuffleSongs( playlist ) ) }/>
					</div>
          <div className="btn-group col-xs-3" role="group">
            <div className={hotBtnClasses} onClick={ () => this.props.dispatch( setSort( TOP ) ) }>Hot</div>
            <div className={newBtnClasses} onClick={ () => this.props.dispatch( setSort( NEW ) ) }>New</div>
          </div>
          <div className="col-xs-4 col-xs-offset-1"> <SearchBar handleSelection={_.throttle(this.handleSearchSelection, 100)}/> </div>
        </div>
        <div className="row">
					<ul className="list-group">
						{ this.renderSongsList() }
					</ul>
        </div>
      </div>
    );
  }
} );
