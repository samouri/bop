import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

import SearchBar from './searchbar'
import TopContributors from './top-contributors'
import SongList from './song-list'
import sdk, { ApiUser, ApiPlaylists, ApiMetadata } from '../sdk'

import { fetchSongs, setSort, requestPlaylist, SORT } from '../state/actions'
import { getCurrentUser, getPlaylistByName } from '../state/reducer'

type Props = {
  match: { params: any }
  dispatch: any
  playlist: ApiPlaylists & { user: any }
  user: ApiUser
}
class PlaylistPage extends React.Component<Props> {
  fetchSongs = _.throttle((props = this.props) => props.dispatch(fetchSongs({})), 200)

  fetchPlaylist = _.throttle((props = this.props) => {
    const {
      match: { params },
      dispatch,
    } = props
    dispatch(requestPlaylist(params.playlistName))
  }, 300)

  componentDidMount() {
    this.fetchPlaylist()
    this.fetchSongs()
    setTimeout(() => {
      // HACK ALERT.  @TODO: account for lag in creation. what i really want is:
      // playlistCreated.then( transitionToPlaylistPage )
      this.fetchPlaylist()
    }, 500)
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.match.params.playlistName && _.isEmpty(nextProps.playlist)) {
      this.fetchPlaylist(nextProps)
      setTimeout(() => {
        // HACK ALERT.  @TODO: account for lag in creation. what i really want is:
        // playlistCreated.then( transitionToPlaylistPage )
        this.fetchPlaylist()
        console.error('happenssss')
      }, 500)
    }
  }

  handleSearchSelection = async ({ title, artist, thumbnailUrl }) => {
    const { playlist, user } = this.props

    const youtubeSearchMeta = await sdk.searchYoutube({ title, artist })
    let songMeta: ApiMetadata | undefined = await sdk.getSongMetadata({
      youtubeId: youtubeSearchMeta.youtube_id,
    })
    console.log(this.props)

    // if we don't have the meta for it yet, create it
    if (!songMeta) {
      const youtubeDuration = await sdk.getYoutubeVideoDuration(youtubeSearchMeta.youtube_id)
      const youtubeMeta = _.mapKeys({ ...youtubeSearchMeta, ...youtubeDuration }, (v, k) =>
        _.camelCase(k)
      )
      const metadata = {
        title,
        artist,
        thumbnailUrl,
        ...youtubeDuration,
        ...youtubeMeta,
      }
      songMeta = await sdk.addSongMetadata(metadata)
      if (!songMeta) {
        throw new Error('could not create SongMeta')
      }
    }

    sdk
      .addSongToPlaylist({
        userId: user.id,
        playlistId: playlist.id,
        metaId: songMeta.id,
      })
      .then(() => this.fetchSongs())
      .catch((err) => {
        console.error('seems like we couldnt add a song', err, err.stack)
      })
  }
  throttledSearchSelection = _.throttle(this.handleSearchSelection, 100)

  setSortHandler = (sort: SORT) => () => {
    this.props.dispatch(setSort({ sort }))
  }

  render() {
    const { playlist } = this.props
    const createdBy = _.get(playlist, 'user.username')
    const ret = (
      <div className="playlist-page">
        <div className="playlist-page__titlestats">
          <span className="playlist-page__title">
            <span>{playlist && playlist.name}</span>
            {playlist && (
              <span className="playlist-page__title-createdby">
                created by <Link to={`/u/${createdBy}`}> @{createdBy} </Link>
              </span>
            )}
          </span>
          <div className="playlist-page__top-contribs">
            <TopContributors playlistId={playlist.id} />
          </div>
        </div>

        <div className="playlist-page__search-bar">
          <i className="fa fa-search" />
          <div style={{ display: 'block' }}>
            <SearchBar handleSelection={this.throttledSearchSelection} />
          </div>
        </div>
        <div style={{ paddingBottom: '80px' }}>
          <SongList stream={{ type: 'playlist', id: playlist.id }} />
        </div>
      </div>
    )
    return ret
  }
}

export default connect<{}, {}, Props>((state, ownProps: any) => {
  return {
    user: getCurrentUser(state),
    playlist: getPlaylistByName(state, ownProps.match.params.playlistName),
  }
})(PlaylistPage)
