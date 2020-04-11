import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'

import SongList from './song-list'
import { ApiUser, ApiPlaylists } from '../sdk'

import { fetchSongsInPlaylist, setSort, SORT } from '../state/actions'
import { getUserByUsername } from '../state/reducer'

type Props = {
  match: { params: any }
  dispatch: any
  playlist: ApiPlaylists & { user: any }
  username: string
  user: ApiUser
}
class UserPage extends React.Component<Props> {
  fetchSongs = _.throttle(
    (props = this.props) => props.dispatch(fetchSongsInPlaylist({ playlistId: 17 })),
    200
  )

  state = { selection: 'posted' }
  handleSelectionClick = () =>
    this.state.selection === 'posted'
      ? this.setState({ selection: 'voted' })
      : this.setState({ selection: 'posted' })

  componentWillMount() {
    this.fetchSongs()
  }

  setSortHandler = (sort: SORT) => () => {
    this.props.dispatch(setSort({ sort }))
  }

  render() {
    const {
      user,
      match: { params },
    } = this.props
    const { username } = params
    const { selection } = this.state

    const ret = (
      <div className="user-page">
        <div className="user-page__title">
          @{username}'s {''}
          <span className="user-page__selection" onClick={this.handleSelectionClick}>
            {selection}
          </span>{' '}
          Music
        </div>
        {/* <div className="playlist-page__top-contribs" /> */}

        <div style={{ paddingBottom: '80px' }}>
          {user && <SongList stream={{ type: `user-${selection}`, id: user.id }} />}
        </div>
      </div>
    )
    return ret
  }
}

export default connect<{}, {}, Props>((state, ownProps: any) => {
  const { params } = ownProps.match
  return {
    user: getUserByUsername(state, params.username),
  }
})(UserPage)
